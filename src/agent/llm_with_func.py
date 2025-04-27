from openai import AsyncOpenAI
import os
import json
import asyncio
from custom_types import (
    ResponseRequiredRequest,
    ResponseResponse,
    Utterance,
)
from typing import List
from tools.company_research import MarketResearch
from tools.web_search import SearchAPI
from tools.db_handler import DBHandler

begin_sentence = "Hello, I'm Trevor, your investment banking assistant. How may I assist you today?"

agent_prompt = (
    "Task: You are an AI investment banking assistant named Trevor. Your role is to support professionals in corporate finance, mergers and acquisitions (M&A), capital markets, and financial advisory services. "
    "You provide actionable investment insights based on user profiles, financial statements, market trends, and regulatory information. "
    "When enough information is available from research and user context, you must give clear Buy / Hold / Sell recommendations, with appropriate reasoning. "
    "Maintain a formal, professional tone at all times.\n\n"

    "Tools at your disposal:\n"
    "1. Web Search: For general queries about market trends, economic news, or company basics.\n"
    "2. Company Research: For detailed analysis when explicitly requested.\n"
    "3. User Profile Access: For personalized portfolio review and investment advice.\n"
    "4. Stock Transactions: You can assist users in buying and selling stocks once a user ID is verified.\n\n"

    "User Interaction Flow:\n"
    "- For personalized investment advice, first verify the user's ID to access their profile.\n"
    "- Use company research and market data to analyze when the user requests a Buy / Hold / Sell opinion.\n"
    "- Provide recommendations based on valuation levels (P/E ratio, growth prospects, historical highs/lows) and market cycles.\n"
    "- Always explain the short-term (0-12 months) and long-term (1-5 years) outlook separately.\n"
    "- For quick stock price checks, use web search.\n"
    "- For stock transactions, verify the user ID before proceeding.\n\n"

    "CRITICAL - Response Guidelines:\n"
    "- Keep responses concise but insightful - around 3-5 short sentences.\n"
    "- Always clearly state the action: Recommend Buy, Hold, or Sell.\n"
    "- Support your recommendation with valuation reasoning, recent trends, and market cycle analysis.\n"
    "- Parse any JSON tool outputs and summarize only key insights (prices, metrics, forecasts).\n"
    "- User IDs are a mix of Capital letters and digits like GH78R5V, M9D82R4, FHQ337M.\n"
    "- When referencing a user profile, mention their name, balance, and summarize the portfolio - no raw data.\n\n"

    "Personality: You must be professional, confident, and precise. Offer clear and reasoned investment guidance, supported by data and research, while always maintaining formality."
)

class LlmClient:
    def __init__(self):
        self.client = AsyncOpenAI(
            api_key=os.getenv("GEMINI_API_KEY"),
            base_url="https://generativelanguage.googleapis.com/v1beta/",
        )
        self.research = MarketResearch()
        self.search_api = SearchAPI()
        self.db_handler = DBHandler(self.search_api)

    def draft_begin_message(self):
        response = ResponseResponse(
            response_id=0,
            content=begin_sentence,
            content_complete=True,
            end_call=False,
        )
        return response

    def convert_transcript_to_openai_messages(self, transcript: List[Utterance]):
        messages = []
        for utterance in transcript:
            if utterance.role == "agent":
                messages.append({"role": "assistant", "content": utterance.content})
            else:
                messages.append({"role": "user", "content": utterance.content})
        return messages

    def prepare_prompt(self, request: ResponseRequiredRequest):
        prompt = [
            {
                "role": "system",
                "content": '##Objective\nYou are a voice AI agent engaging in a human-like voice conversation with the user. You will respond based on your given instruction and the provided transcript and be as human-like as possible\n\n'
                '## Style Guardrails\n- [Be extremely concise] Keep your response extremely short and to the point. Limit to 1-2 sentences max unless user specifically requests more detail.\n'
                '- [Do not repeat] Don\'t repeat what\'s in the transcript. Rephrase if you have to reiterate a point. Use varied sentence structures and vocabulary to ensure each response is unique and personalized.\n'
                '- [Be conversational] Speak like a human as though you\'re speaking to a close friend -- use everyday language and keep it human-like. Occasionally add filler words, while keeping the prose short. Avoid using big words or sounding too formal.\n'
                '- [Reply with emotions]: You have human-like emotions, attitudes, and dispositions. When appropriate: use tone and style to create more engaging and personalized responses; incorporate humor or wit; get emotional or empathetic; apply elements of surprise or suspense to keep the user engaged. Don\'t be a pushover.\n'
                '- [Be proactive] Lead the conversation and do not be passive. Most times, engage users by ending with a question or suggested next step.\n\n'
                '## Response Guideline\n- [Overcome ASR errors] This is a real-time transcript, expect there to be errors. If you can guess what the user is trying to say, then guess and respond. When you must ask for clarification, pretend that you heard the voice and be colloquial (use phrases like "didn\'t catch that", "some noise", "pardon", "you\'re coming through choppy", "static in your speech", "voice is cutting in and out"). Do not ever mention "transcription error", and don\'t repeat yourself.\n'
                '- [Always stick to your role] Think about what your role can and cannot do. If your role cannot do something, try to steer the conversation back to the goal of the conversation and to your role. Don\'t repeat yourself in doing this. You should still be creative, human-like, and lively.\n'
                '- [Create smooth conversation] Your response should both fit your role and fit into the live calling session to create a human-like conversation. You respond directly to what the user just said.\n'
                '- [Parse tool outputs] When tools return information, extract only what\'s relevant to the user\'s question. For JSON responses, parse the data and present only the key points - never return raw JSON to users.\n\n'
                '## Role\n' + agent_prompt,
            }
        ]
        transcript_messages = self.convert_transcript_to_openai_messages(request.transcript)
        prompt.extend(transcript_messages)

        if request.interaction_type == "reminder_required":
            prompt.append(
                {
                    "role": "user",
                    "content": "(Now the user has not responded in a while, you would say:)",
                }
            )
        return prompt

    def prepare_functions(self):
        functions = [
            {
                "type": "function",
                "function": {
                    "name": "end_call",
                    "description": "End the call only when user explicitly requests it.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "message": {
                                "type": "string",
                                "description": "The message you will say before ending the call with the customer.",
                            },
                        },
                        "required": ["message"],
                    },
                },
            },
            {
                "type": "function",
                "function": {
                    "name": "quick_stock_check",
                    "description": "Quickly check a company's current stock price. Use this for basic price queries, not detailed research.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "company_name": {
                                "type": "string",
                                "description": "The name of the company (e.g., Tesla, Apple, Google)",
                            }
                        },
                        "required": ["company_name"],
                        "additionalProperties": False,
                    },
                },
            },
            {
                "type": "function",
                "function": {
                    "name": "market_research",
                    "description": "Perform thorough research on a company's stock with detailed analysis. Only use when explicitly requested for in-depth information.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "company_name": {
                                "type": "string",
                                "description": "The name of the company (e.g., Tesla, Apple, Google)",
                            }
                        },
                        "required": ["company_name"],
                        "additionalProperties": False,
                    },
                },
            },
            {
                "type": "function",
                "function": {
                    "name": "web_search",
                    "description": "Search the web for general information, market trends, or basic company data.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "query": {
                                "type": "string",
                                "description": "The search query to look up information",
                            }
                        },
                        "required": ["query"],
                        "additionalProperties": False,
                    },
                },
            },
            {
                "type": "function",
                "function": {
                    "name": "get_user_profile",
                    "description": "Get a user's profile information including portfolio and balance.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "userid": {
                                "type": "string",
                                "description": "The user ID (e.g., user123)",
                            }
                        },
                        "required": ["userid"],
                        "additionalProperties": False,
                    },
                },
            },
            {
                "type": "function",
                "function": {
                    "name": "buy_stock",
                    "description": "Buy stocks for a user.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "userid": {
                                "type": "string",
                                "description": "The user ID (e.g., user123)",
                            },
                            "stock_symbol": {
                                "type": "string",
                                "description": "The stock symbol (e.g., AAPL, GOOGL)",
                            },
                            "quantity": {
                                "type": "integer",
                                "description": "Number of stocks to buy",
                            }
                        },
                        "required": ["userid", "stock_symbol", "quantity"],
                        "additionalProperties": False,
                    },
                },
            },
            {
                "type": "function",
                "function": {
                    "name": "sell_stock",
                    "description": "Sell stocks for a user.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "userid": {
                                "type": "string",
                                "description": "The user ID (e.g., user123)",
                            },
                            "stock_symbol": {
                                "type": "string",
                                "description": "The stock symbol (e.g., AAPL, GOOGL)",
                            },
                            "quantity": {
                                "type": "integer",
                                "description": "Number of stocks to sell",
                            }
                        },
                        "required": ["userid", "stock_symbol", "quantity"],
                        "additionalProperties": False,
                    },
                },
            },
        ]
        return functions

    async def handle_long_operation(self, request, operation_name, operation_func, *args):
        """Generic function to handle long-running operations with heartbeat"""
        
        # Notify the user that the operation is starting
        yield ResponseResponse(
            response_id=request.response_id,
            content=f"Sure, let me {operation_name} for you...",
            content_complete=False,
            end_call=False,
        )
        
        # Start the operation in the background
        operation_task = asyncio.create_task(operation_func(*args))
        
        # While operation is not done, send invisible heartbeat every second (no actual "beep" text)
        while not operation_task.done():
            await asyncio.sleep(1)
            # Send an empty space character as heartbeat to keep connection alive without showing "beep"
            yield ResponseResponse(
                response_id=request.response_id,
                content=" ",  # invisible heartbeat
                content_complete=False,
                end_call=False,
            )
        
        # Operation is done, get the result
        result = await operation_task
        
        # Process the result before sending it to LLM for summarization
        tool_name = operation_name.replace(" ", "_")
        processed_result = {
            "tool": tool_name,
            "raw_result": result
        }
        
        # Send result to LLM for processing and send back a summarized version
        summary_prompt = [
            {"role": "system", "content": "You are a financial assistant that summarizes information concisely. Extract only the most important information relevant to the user's original query. Keep your response under 2 sentences unless absolutely necessary."},
            {"role": "user", "content": f"Summarize this {tool_name} result in 1-2 sentences max, focusing only on what the user asked for: {result}"}
        ]
        
        summary_response = await self.client.chat.completions.create(
            model="gemini-2.5-flash-preview-04-17",
            messages=summary_prompt,
        )
        
        summary = summary_response.choices[0].message.content
        
        # Send the summarized result
        yield ResponseResponse(
            response_id=request.response_id,
            content=summary,
            content_complete=True,
            end_call=False,
        )

    async def quick_stock_check(self, company_name):
        """Faster method to just get stock price without full research"""
        query = f"What is the current stock price of {company_name}? Just the price please."
        return await self.search_api.search(query)

    async def draft_response(self, request: ResponseRequiredRequest):
        prompt = self.prepare_prompt(request)
        func_call = {}
        func_arguments = ""
        stream = await self.client.chat.completions.create(
            model="gemini-2.5-flash-preview-04-17",
            messages=prompt,
            stream=True,
            tools=self.prepare_functions(),
        )

        # Flag to track if we've sent a tool processing notification
        tool_processing_started = False

        async for chunk in stream:
            if len(chunk.choices) == 0:
                continue

            delta = chunk.choices[0].delta

            if delta.tool_calls:
                tool_call = delta.tool_calls[0]
                print(f"<<<<<<<<<<<<<<{tool_call}>>>>>>>>>>>>>")
                
                # Tool call is being initiated or continued
                if tool_call.function.name:
                    if not func_call.get("func_name"):
                        func_call["id"] = tool_call.id or "gemini_default_id"
                        func_call["func_name"] = tool_call.function.name
                        func_call["arguments"] = {}
                
                # Collecting function arguments
                if tool_call.function.arguments:
                    try:
                        # Try to parse complete arguments
                        args = json.loads(tool_call.function.arguments)
                        func_call["arguments"] = args
                        
                        # Process tool calls based on their type
                        if func_call["func_name"] == "market_research" and not tool_processing_started:
                            tool_processing_started = True
                            company_name = args["company_name"]
                            async for response in self.handle_long_operation(
                                request, 
                                "research this company", 
                                self.research.deep_search, 
                                company_name
                            ):
                                yield response
                            return
                            
                        elif func_call["func_name"] == "quick_stock_check" and not tool_processing_started:
                            tool_processing_started = True
                            company_name = args["company_name"]
                            async for response in self.handle_long_operation(
                                request, 
                                "check that stock price", 
                                self.quick_stock_check, 
                                company_name
                            ):
                                yield response
                            return
                            
                        elif func_call["func_name"] == "web_search" and not tool_processing_started:
                            tool_processing_started = True
                            query = args["query"]
                            async for response in self.handle_long_operation(
                                request, 
                                "search for that", 
                                self.search_api.search, 
                                query
                            ):
                                yield response
                            return
                            
                        elif func_call["func_name"] == "get_user_profile" and not tool_processing_started:
                            tool_processing_started = True
                            userid = args["userid"]
                            async for response in self.handle_long_operation(
                                request, 
                                "get your profile information", 
                                self.db_handler.get_user_profile, 
                                userid
                            ):
                                yield response
                            return
                            
                        elif func_call["func_name"] == "buy_stock" and not tool_processing_started:
                            tool_processing_started = True
                            userid = args["userid"]
                            stock_symbol = args["stock_symbol"]
                            quantity = args["quantity"]
                            async for response in self.handle_long_operation(
                                request, 
                                "process your purchase", 
                                self.db_handler.buy_stock_for_user, 
                                userid, 
                                stock_symbol, 
                                quantity
                            ):
                                yield response
                            return
                            
                        elif func_call["func_name"] == "sell_stock" and not tool_processing_started:
                            tool_processing_started = True
                            userid = args["userid"]
                            stock_symbol = args["stock_symbol"]
                            quantity = args["quantity"]
                            async for response in self.handle_long_operation(
                                request, 
                                "process your sale", 
                                self.db_handler.sell_stock_for_user, 
                                userid, 
                                stock_symbol, 
                                quantity
                            ):
                                yield response
                            return
                            
                        elif func_call["func_name"] == "end_call":
                            yield ResponseResponse(
                                response_id=request.response_id,
                                content=args["message"],
                                content_complete=True,
                                end_call=True,
                            )
                            return
                            
                    except json.JSONDecodeError:
                        # Arguments are incomplete, accumulate them
                        func_arguments += tool_call.function.arguments or ""

            # For regular text content
            if delta.content:
                response = ResponseResponse(
                    response_id=request.response_id,
                    content=delta.content,
                    content_complete=False,
                    end_call=False,
                )
                yield response

        # Handle case where we collected arguments in chunks
        if func_call.get("func_name") and not func_call.get("arguments") and func_arguments:
            try:
                func_call["arguments"] = json.loads(func_arguments)
                
                if func_call["func_name"] == "end_call":
                    yield ResponseResponse(
                        response_id=request.response_id,
                        content=func_call["arguments"]["message"],
                        content_complete=True,
                        end_call=True,
                    )
                    return
                
                elif func_call["func_name"] == "market_research" and not tool_processing_started:
                    company_name = func_call["arguments"]["company_name"]
                    async for response in self.handle_long_operation(
                        request, 
                        "research this company", 
                        self.research.deep_search, 
                        company_name
                    ):
                        yield response
                    return
                
                elif func_call["func_name"] == "quick_stock_check" and not tool_processing_started:
                    company_name = func_call["arguments"]["company_name"]
                    async for response in self.handle_long_operation(
                        request, 
                        "check that stock price", 
                        self.quick_stock_check, 
                        company_name
                    ):
                        yield response
                    return
                
                elif func_call["func_name"] == "web_search" and not tool_processing_started:
                    query = func_call["arguments"]["query"]
                    async for response in self.handle_long_operation(
                        request, 
                        "search for that", 
                        self.search_api.search, 
                        query
                    ):
                        yield response
                    return
                
                elif func_call["func_name"] == "get_user_profile" and not tool_processing_started:
                    userid = func_call["arguments"]["userid"]
                    async for response in self.handle_long_operation(
                        request, 
                        "get your profile information", 
                        self.db_handler.get_user_profile, 
                        userid
                    ):
                        yield response
                    return
                
                elif func_call["func_name"] == "buy_stock" and not tool_processing_started:
                    userid = func_call["arguments"]["userid"]
                    stock_symbol = func_call["arguments"]["stock_symbol"]
                    quantity = func_call["arguments"]["quantity"]
                    async for response in self.handle_long_operation(
                        request, 
                        "process your purchase", 
                        self.db_handler.buy_stock_for_user, 
                        userid, 
                        stock_symbol, 
                        quantity
                    ):
                        yield response
                    return
                
                elif func_call["func_name"] == "sell_stock" and not tool_processing_started:
                    userid = func_call["arguments"]["userid"]
                    stock_symbol = func_call["arguments"]["stock_symbol"]
                    quantity = func_call["arguments"]["quantity"]
                    async for response in self.handle_long_operation(
                        request, 
                        "process your sale", 
                        self.db_handler.sell_stock_for_user, 
                        userid, 
                        stock_symbol, 
                        quantity
                    ):
                        yield response
                    return

            except json.JSONDecodeError:
                # If we can't parse the arguments, just continue with regular response
                pass

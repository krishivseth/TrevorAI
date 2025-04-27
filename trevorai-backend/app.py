from flask import Flask, jsonify
import json
import os

from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load the portfolio data
DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "user_data.json")
# Load the transactions data
TRANSACTION_PATH = os.path.join(os.path.dirname(__file__), "data", "user_transaction.json")

def load_portfolios():
    with open(DATA_PATH, "r") as file:
        return json.load(file)
    
def load_transactions():
    with open(TRANSACTION_PATH, "r") as file:
        return json.load(file)

@app.route("/api/transactions/<userid>", methods=["GET"])
def get_user_transactions(userid):
    transactions = load_transactions()
    user_transactions = [tx for tx in transactions if tx["userid"] == userid]
    return jsonify(user_transactions)

@app.route("/api/portfolio/<userid>", methods=["GET"])
def get_user_portfolio(userid):
    portfolios = load_portfolios()
    user_portfolio = next((user for user in portfolios if user["userid"] == userid), None)
    if user_portfolio:
        return jsonify(user_portfolio)
    else:
        return jsonify({"error": "User not found"}), 404

@app.route("/api/portfolios", methods=["GET"])
def get_all_portfolios():
    portfolios = load_portfolios()
    return jsonify(portfolios)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8081, debug=True)

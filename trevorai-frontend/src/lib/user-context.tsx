"use client";

import { createContext, useContext, useState, ReactNode } from "react";

const users = [
  { userid: "FYJ57", name: "Alice Johnson - FYJ57" },
  { userid: "KXJ83", name: "Bob Smith - KXJ83" },
  { userid: "CX734", name: "Charlie Lee - CX734" },
];

type User = typeof users[number];

interface UserContextType {
  selectedUser: User;
  setSelectedUser: (user: User) => void;
  users: User[];
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [selectedUser, setSelectedUser] = useState<User>(users[0]); // default Alice

  return (
    <UserContext.Provider value={{ selectedUser, setSelectedUser, users }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used inside a UserProvider");
  }
  return context;
}

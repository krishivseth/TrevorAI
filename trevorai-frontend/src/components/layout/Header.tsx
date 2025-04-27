"use client";

import { usePathname, useRouter } from 'next/navigation';
import { useUser } from "@/lib/user-context"; // ADD THIS

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { selectedUser, setSelectedUser, users } = useUser(); // Get user info

  let targetPath: string;
  let buttonText: string;

  if (pathname === '/transactions') {
    targetPath = '/portfolio';
    buttonText = 'View Portfolio';
  } else {
    targetPath = '/transactions';
    buttonText = 'View Transactions';
  }

  const handleNavigate = () => {
    router.push(targetPath);
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userid = e.target.value;
    const user = users.find(u => u.userid === userid);
    if (user) {
      setSelectedUser(user);
    }
  };

  return (
    <header className="bg-gradient-to-b from-blue-700 to-blue-500 px-4 py-6 lg:px-14">
      <div className="max-w-screen-2xl mx-auto">
        <div className="w-full flex items-center justify-between mb-8">
          <div>
            <span className="text-white text-2xl font-bold">TrevorAI</span>
          </div>
          <div className="flex items-center space-x-4">
            {/* Dynamic account selector */}
            <div className="flex items-center space-x-2">
              <label htmlFor="account-select" className="text-sm font-medium text-blue-100">Accounts:</label>
              <select
                id="account-select"
                value={selectedUser.userid}
                onChange={handleChange}
                className="bg-blue-700 border border-blue-500 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-white text-white"
              >
                {users.map(user => (
                  <option key={user.userid} value={user.userid}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleNavigate}
              className="bg-white text-blue-700 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100"
            >
              {buttonText}
            </button>
          </div>
        </div>
        <div className="text-white pb-16">
          <h2 className="text-2xl lg:text-4xl font-medium">Welcome Back 👋</h2>
          <p className="text-sm lg:text-base text-blue-200">This is your financial overview report.</p>
        </div>
      </div>
    </header>
  );
}

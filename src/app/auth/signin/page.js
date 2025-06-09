"use client";

import { signIn } from "next-auth/react";

export default function SignIn() {
  const callbackUrl = "/dashboard/overview";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Use your organization account
          </p>
        </div>
        <div className="mt-8 space-y-6">
          {/* <button
            onClick={() => signIn("azure-ad", { callbackUrl })}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign in with Microsoft
          </button> */}

          <button
            className="flex items-center justify-center w-full py-3 px-4 bg-[#2f2f2f] text-white rounded-md hover:bg-[#1f1f1f] transition-colors mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 cursor-pointer"
            onClick={() => signIn("azure-ad", { callbackUrl })}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 21 21"
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2"
            >
              <rect x="1" y="1" width="9" height="9" fill="#f25022"></rect>
              <rect x="1" y="11" width="9" height="9" fill="#00a4ef"></rect>
              <rect x="11" y="1" width="9" height="9" fill="#7fba00"></rect>
              <rect x="11" y="11" width="9" height="9" fill="#ffb900"></rect>
            </svg>
            Sign in with Microsoft
          </button>
        </div>
      </div>
    </div>
  );
}

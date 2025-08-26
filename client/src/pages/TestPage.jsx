import React from 'react';

const TestPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Test Page</h1>
        <p className="text-gray-600">If you can see this, the React app is working!</p>
        <div className="mt-4">
          <p className="text-sm text-gray-500">
            Current URL: {window.location.href}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestPage;

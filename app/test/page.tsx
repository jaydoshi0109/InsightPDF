'use client';
import { useEffect, useState } from "react";
async function testDbConnection() {
  try {
    const response = await fetch('/api/test-db');
    const data = await response.json();
    return { success: response.ok, data };
  } catch (error) {
    ;
    return { success: false, error: String(error) };
  }
}
export default function TestPage() {
  const [testResult, setTestResult] = useState<any>(null);
  useEffect(() => {
    testDbConnection().then(result => {
      ;
      setTestResult(result);
    });
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-white mb-4">Database Connection Test</h1>
        {testResult ? (
          <div className="mt-6 p-4 bg-slate-800 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-2">
              {testResult.success ? "✅ Test Passed" : "❌ Test Failed"}
            </h2>
            <pre className="bg-slate-900 p-4 rounded overflow-auto text-sm text-gray-300">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        ) : (
          <p className="text-indigo-200">
            Testing database connection...
          </p>
        )}
        <div className="mt-8 p-4 bg-slate-800/50 rounded-lg">
          <h3 className="text-lg font-medium text-white mb-2">Troubleshooting:</h3>
          <ul className="list-disc list-inside text-indigo-200 space-y-1">
            <li>Check your browser's developer console for detailed logs</li>
            <li>Verify DATABASE_URL is set in your .env file</li>
            <li>Ensure your database is running and accessible</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

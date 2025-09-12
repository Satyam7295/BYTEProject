import React from 'react';
import ReadmeGenerator from './components/ReadmeGenerator.jsx';
import { ToastContainer } from 'react-toastify';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Generate a Polished README</h1>
          <p className="mt-2 text-gray-600">Paste a GitHub repository URL and let the backend craft a README. Preview, copy, and iterate.</p>
        </div>
        <ReadmeGenerator />
      </main>
      <ToastContainer position="top-right" autoClose={2500} hideProgressBar newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
    </div>
  );
}
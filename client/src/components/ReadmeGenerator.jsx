import React, { useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import { toast } from 'react-toastify';

const GITHUB_URL_REGEX = /^(https?:\/\/)?(www\.)?github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(\/)?$/i;

export default function ReadmeGenerator() {
  const [repoUrl, setRepoUrl] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [readme, setReadme] = useState('');
  const [error, setError] = useState('');
  const previewRef = useRef(null);

  // Validate on each change
  const handleChange = (e) => {
    const value = e.target.value.trim();
    setRepoUrl(value);
    setIsValid(GITHUB_URL_REGEX.test(value));
  };

  const helperText = useMemo(() => {
    if (!repoUrl) return 'Example: https://github.com/owner/repo';
    return isValid ? 'Looks good!' : 'Enter a valid GitHub repo URL.';
  }, [repoUrl, isValid]);

  const handleGenerate = async () => {
    if (!isValid) {
      toast.error('Please enter a valid GitHub repo URL.');
      return;
    }

    setLoading(true);
    setError('');
    setReadme('');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const res = await fetch('/api/generate-readme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        // Try parse JSON error if available
        let serverMsg = text;
        try { serverMsg = JSON.parse(text)?.error || serverMsg; } catch {}
        throw new Error(serverMsg || `Request failed with ${res.status}`);
      }

      const data = await res.json();
      const content = data?.readme || '';
      setReadme(content);

      // Announce update for accessibility
      if (previewRef.current) {
        previewRef.current.focus();
      }
    } catch (err) {
      console.error(err);
      let message = 'Failed to reach the server.';
      if (err?.name === 'AbortError') {
        message = 'Request timed out.';
      } else if (err?.message) {
        // Map common network errors
        if (/Failed to fetch|NetworkError/i.test(err.message)) {
          message = 'Network error. Is the backend running?';
        } else {
          message = err.message;
        }
      }
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(readme);
      toast.success('README copied to clipboard');
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* Left: Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 lg:sticky lg:top-6">
        <label htmlFor="repoUrl" className="block text-sm font-medium text-gray-700">
          GitHub Repository URL
        </label>
        <div className="mt-2">
          <input
            id="repoUrl"
            name="repoUrl"
            type="url"
            value={repoUrl}
            onChange={handleChange}
            placeholder="https://github.com/owner/repo"
            className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition text-sm sm:text-base
              ${repoUrl && !isValid ? 'border-red-400 focus:ring-red-300' : 'border-gray-300 focus:ring-indigo-300'}`}
            aria-invalid={repoUrl ? String(!isValid) : undefined}
            aria-describedby="repoUrl-help"
          />
          <p id="repoUrl-help" className={`mt-1 text-sm ${repoUrl && !isValid ? 'text-red-600' : 'text-gray-500'}`}>
            {helperText}
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!isValid || loading}
          className="mt-4 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              Generating...
            </span>
          ) : (
            'Generate README'
          )}
        </button>

        {error && (
          <div role="alert" className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
            {error}
          </div>
        )}
      </div>

      {/* Right: Preview */}
      <div
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 h-[60vh] lg:h-[75vh] overflow-auto"
        tabIndex={0}
        ref={previewRef}
        aria-live="polite"
        aria-busy={loading ? 'true' : 'false'}
      >
        {!readme && !loading && (
          <p className="text-gray-500">Your generated README will appear here.</p>
        )}
        {readme && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">README Preview</h2>
              <button
                onClick={handleCopy}
                className="inline-flex items-center px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium border border-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
              >
                Copy README
              </button>
            </div>
            <article className="prose max-w-none">
              <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                {readme}
              </ReactMarkdown>
            </article>
          </div>
        )}
      </div>
    </section>
  );
}
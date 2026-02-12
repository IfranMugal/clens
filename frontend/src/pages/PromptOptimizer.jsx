import React,{ useState } from "react";
import API from "../services/api";
import { ClipboardIcon } from "@heroicons/react/24/outline";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function PromptOptimizer({ user }) {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleOptimize = async () => {
    if (!prompt.trim()) return;

    try {
      setLoading(true);
      setResult(null);
      setAccepted(false);

      const res = await API.post("/prompt-optimize", { prompt });
      setResult(res.data);
    } catch (err) {
      alert("Optimization failed");
    } finally {
      setLoading(false);
    }
  };

  const acceptOptimization = async () => {
    if (!result || accepted) return;

    try {
      setSaving(true);

      await API.post("/users/add-saved", {
        email: user.email,
        co2Saved: result.estimatedCo2SavedKg,
      });

      setAccepted(true);
    } catch (err) {
      alert("Failed to apply sustainability impact");
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result.optimizedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const chartData = result
    ? [
        { name: "Original", tokens: result.originalEstimatedTokens },
        { name: "Optimized", tokens: result.optimizedEstimatedTokens },
      ]
    : [];

  return (
    <div className="bg-gradient-to-br from-green-50 to-white min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold mb-2 text-green-800">
          Prompt Sustainability Optimizer
        </h2>
        <p className="text-gray-600 mb-8">
          Reduce AI compute waste by optimizing prompt verbosity.
        </p>

        {/* Input */}
        <div className="bg-white p-6 rounded-2xl shadow-md mb-8">
          <textarea
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full border rounded-lg p-4 mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter your original prompt..."
          />

          <button
            onClick={handleOptimize}
            className="bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded-lg transition"
          >
            {loading ? "Optimizing..." : "Optimize Prompt"}
          </button>
        </div>

        {result && (
          <>
            {/* Prompt Comparison */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="font-semibold mb-2 text-gray-700">
                  Original Prompt
                </h3>
                <p className="text-gray-600">{result.originalPrompt}</p>
              </div>

              <div className="bg-green-100 p-6 rounded-xl shadow-sm relative">
                <h3 className="font-semibold mb-2 text-green-900">
                  Optimized Prompt
                </h3>
                <p className="text-green-900 pr-10">
                  {result.optimizedPrompt}
                </p>

                <button
                  onClick={copyToClipboard}
                  className="absolute top-4 right-4 text-green-800 hover:text-green-900"
                >
                  <ClipboardIcon className="h-5 w-5" />
                </button>

                {copied && (
                  <span className="text-xs text-green-700">
                    Copied!
                  </span>
                )}
              </div>
            </div>

            {/* Metrics */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <MetricCard
                title="Token Reduction"
                value={`${result.tokensSaved}`}
              />
              <MetricCard
                title="Reduction %"
                value={`${result.percentageReduction}%`}
              />
              <MetricCard
                title="Energy Saved"
                value={`${result.estimatedEnergySavedKwh}`}
              />
              <MetricCard
                title="CO₂ Saved (kg)"
                value={`${result.estimatedCo2SavedKg}`}
              />
            </div>

            {/* Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
              <h3 className="font-semibold mb-4">
                Token Usage Comparison
              </h3>

              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="tokens" fill="#15803d" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Accept */}
            <div className="flex justify-end">
              <button
                onClick={acceptOptimization}
                disabled={accepted || saving}
                className={`px-6 py-2 rounded-lg font-semibold transition-all
                  ${
                    accepted
                      ? "bg-green-300 text-green-900"
                      : "bg-green-700 hover:bg-green-800 text-white"
                  }`}
              >
                {accepted
                  ? "✔ Optimization Applied"
                  : saving
                  ? "Applying..."
                  : "Accept Optimization"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MetricCard({ title, value }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm text-center">
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <p className="text-lg font-bold text-green-800">{value}</p>
    </div>
  );
}

export default PromptOptimizer;

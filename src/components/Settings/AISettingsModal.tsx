import React, { useState } from 'react';
import type { AISettings, AIProvider } from '../../types';
import { X, Sparkles, Key, Cpu, Sliders, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: AISettings;
  onSave: (newSettings: AISettings) => void;
}

const PROVIDER_MODELS: Record<AIProvider, { label: string; value: string }[]> = {
  gemini: [
    { label: 'Gemini 1.5 Flash (Fast & Recommended)', value: 'gemini-1.5-flash' },
    { label: 'Gemini 2.0 Flash (Experimental)', value: 'gemini-2.0-flash' },
    { label: 'Gemini 1.5 Pro (Deep Reasoning)', value: 'gemini-1.5-pro' }
  ],
  openai: [
    { label: 'GPT-4o Mini (Fast & Cost Efficient)', value: 'gpt-4o-mini' },
    { label: 'GPT-4o (State of the art)', value: 'gpt-4o' }
  ],
  groq: [
    { label: 'Llama 3.3 70B Versatile (Blazing Fast)', value: 'llama-3.3-70b-versatile' },
    { label: 'Llama 3.1 8B Instant', value: 'llama-3.1-8b-instant' }
  ],
  anthropic: [
    { label: 'Claude 3.5 Sonnet', value: 'claude-3-5-sonnet-20241022' },
    { label: 'Claude 3.5 Haiku', value: 'claude-3-5-haiku-20241022' }
  ],
  ollama: [
    { label: 'Llama 3 (Local)', value: 'llama3' },
    { label: 'Mistral (Local)', value: 'mistral' },
    { label: 'DeepSeek R1 (Local)', value: 'deepseek-r1' },
    { label: 'Custom Model', value: 'custom' }
  ],
  demo: [
    { label: 'Built-in Intelligent Demo Simulator (No API Key Required)', value: 'demo' }
  ]
};

const PROVIDER_DOCS: Record<AIProvider, { url: string; label: string }> = {
  gemini: { url: 'https://aistudio.google.com/app/apikey', label: 'Get Free Google Gemini API Key' },
  openai: { url: 'https://platform.openai.com/api-keys', label: 'Get OpenAI API Key' },
  groq: { url: 'https://console.groq.com/keys', label: 'Get Free Groq API Key' },
  anthropic: { url: 'https://console.anthropic.com/', label: 'Get Anthropic API Key' },
  ollama: { url: 'https://ollama.com/', label: 'Download Ollama for Local AI' },
  demo: { url: '#', label: 'No setup required' }
};

export const AISettingsModal: React.FC<Props> = ({ isOpen, onClose, settings, onSave }) => {
  const [formData, setFormData] = useState<AISettings>({ ...settings });
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testError, setTestError] = useState<string>('');

  if (!isOpen) return null;

  const handleProviderChange = (provider: AIProvider) => {
    const defaultModel = PROVIDER_MODELS[provider]?.[0]?.value || '';
    setFormData(prev => ({
      ...prev,
      provider,
      model: defaultModel,
      baseUrl: provider === 'ollama' ? 'http://localhost:11434' : prev.baseUrl
    }));
  };

  const handleTestConnection = async () => {
    if (formData.provider === 'demo') {
      setTestStatus('success');
      return;
    }

    if (!formData.apiKey && formData.provider !== 'ollama') {
      setTestStatus('error');
      setTestError('Please enter an API key first.');
      return;
    }

    setTestStatus('testing');
    setTestError('');

    try {
      if (formData.provider === 'gemini') {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${formData.apiKey}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}: Invalid API Key`);
      } else if (formData.provider === 'groq' || formData.provider === 'openai') {
        const endpoint = formData.provider === 'groq' ? 'https://api.groq.com/openai/v1/models' : 'https://api.openai.com/v1/models';
        const res = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${formData.apiKey}` }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}: Authentication failed`);
      } else if (formData.provider === 'ollama') {
        const base = (formData.baseUrl || 'http://localhost:11434').replace(/\/$/, '');
        const res = await fetch(`${base}/api/tags`);
        if (!res.ok) throw new Error('Could not connect to Ollama. Make sure Ollama is running.');
      }
      setTestStatus('success');
    } catch (err: any) {
      setTestStatus('error');
      setTestError(err.message || 'Connection failed.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-200 animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="bg-[#185abd] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold">AI Assistant Configuration</h2>
              <p className="text-xs text-blue-100">Connect Google Gemini, OpenAI, Groq, Anthropic or Local Ollama</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Provider Select */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Select AI Provider
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['gemini', 'openai', 'groq', 'anthropic', 'ollama', 'demo'] as AIProvider[]).map((prov) => (
                <button
                  key={prov}
                  type="button"
                  onClick={() => handleProviderChange(prov)}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    formData.provider === prov
                      ? 'border-[#185abd] bg-blue-50 text-[#185abd] shadow-xs'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  {prov === 'gemini' && 'Google Gemini'}
                  {prov === 'openai' && 'OpenAI'}
                  {prov === 'groq' && 'Groq (Ultra-Fast)'}
                  {prov === 'anthropic' && 'Anthropic'}
                  {prov === 'ollama' && 'Ollama (Local)'}
                  {prov === 'demo' && 'Demo Simulator'}
                </button>
              ))}
            </div>
          </div>

          {/* API Key (if not demo or ollama) */}
          {formData.provider !== 'demo' && formData.provider !== 'ollama' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-gray-500" />
                  API Key
                </label>
                {PROVIDER_DOCS[formData.provider] && (
                  <a
                    href={PROVIDER_DOCS[formData.provider].url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#185abd] hover:underline flex items-center gap-1"
                  >
                    {PROVIDER_DOCS[formData.provider].label}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <input
                type="password"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                placeholder={`Enter your ${formData.provider} API key...`}
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#185abd] focus:border-[#185abd] outline-none"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Keys are stored locally in your browser and never sent to any external server.
              </p>
            </div>
          )}

          {/* Base URL for Ollama */}
          {formData.provider === 'ollama' && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Ollama Endpoint URL
              </label>
              <input
                type="text"
                value={formData.baseUrl || 'http://localhost:11434'}
                onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                placeholder="http://localhost:11434"
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#185abd] outline-none"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Ensure Ollama is running locally with <code className="bg-gray-100 px-1 py-0.5 rounded">OLLAMA_ORIGINS="*"</code>.
              </p>
            </div>
          )}

          {/* Model Selection */}
          {formData.provider !== 'demo' && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Model
              </label>
              <select
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#185abd] outline-none bg-white"
              >
                {PROVIDER_MODELS[formData.provider]?.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Temperature Slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-gray-500" />
                Creativity (Temperature: {formData.temperature})
              </label>
              <span className="text-xs text-gray-500">
                {formData.temperature < 0.4 ? 'Precise / Factual' : formData.temperature > 0.8 ? 'Creative / Flowing' : 'Balanced'}
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.2"
              step="0.1"
              value={formData.temperature}
              onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
              className="w-full accent-[#185abd]"
            />
          </div>

          {/* Test Status feedback */}
          {testStatus === 'success' && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Connection successful! AI assistant is ready.</span>
            </div>
          )}

          {testStatus === 'error' && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{testError}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-between border-t border-gray-100">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testStatus === 'testing'}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {testStatus === 'testing' ? 'Testing...' : 'Test Connection'}
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-medium text-white bg-[#185abd] hover:bg-[#12499c] rounded-lg shadow-sm transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

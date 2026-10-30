import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, ActionProposal, AISettings } from '../../types';
import { AIService } from '../../services/aiService';
import {
  Sparkles,
  Send,
  X,
  FileText,
  CheckCircle2,
  Table as TableIcon,
  Trash2,
  Settings,
  Bot,
  User,
  Check,
  RefreshCw,
  Mic,
  MicOff
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
  fullDocumentText: string;
  aiSettings: AISettings;
  onOpenSettings: () => void;
  onApplyProposal: (proposal: ActionProposal) => void;
}

export const AICopilotSidebar: React.FC<Props> = ({
  isOpen,
  onClose,
  selectedText,
  fullDocumentText,
  aiSettings,
  onOpenSettings,
  onApplyProposal
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `👋 Hello! I'm your **Word AI Copilot** (powered by ${aiSettings.provider === 'demo' ? 'Built-in Demo Engine' : aiSettings.provider.toUpperCase()}).

I have real-time access to your document context. I can write paragraphs, insert tables, proofread, and make direct edits into your document.

💡 **Slash Commands Supported**:
* \`/table [title]\` — Generate and insert a custom data table
* \`/summary\` — Synthesize an Executive Summary
* \`/proofread\` — Scan document for grammar and clarity
* \`/tone professional\` — Polish selection into executive voice`,
      timestamp: new Date()
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  // Speech to text toggle
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleSend = async (customPrompt?: string) => {
    const promptToSend = customPrompt || input;
    if (!promptToSend.trim() || isLoading) return;

    // Handle slash commands
    let finalPrompt = promptToSend;
    if (promptToSend.startsWith('/table')) {
      finalPrompt = `Create a detailed, beautifully structured table for: ${promptToSend.replace('/table', '').trim() || 'Project Plan'}`;
    } else if (promptToSend.startsWith('/summary')) {
      finalPrompt = 'Synthesize a clear, 3-bullet Executive Summary from the document context.';
    } else if (promptToSend.startsWith('/proofread')) {
      finalPrompt = 'Proofread the document and propose fixes for any grammar or spelling issues.';
    } else if (promptToSend.startsWith('/tone')) {
      finalPrompt = `Rewrite the selected text or document in a ${promptToSend.replace('/tone', '').trim() || 'formal executive'} tone.`;
    }

    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      role: 'user',
      content: promptToSend,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await AIService.sendChatMessage(
        [...messages, { ...userMsg, content: finalPrompt }],
        aiSettings,
        { selectedText, fullDocumentText }
      );

      const assistantMsg: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        role: 'assistant',
        content: response.text,
        proposal: response.proposal,
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(2, 9),
          role: 'assistant',
          content: `⚠️ Error: ${err.message || 'Something went wrong.'} Please check your AI Settings.`,
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = (messageId: string, proposal: ActionProposal) => {
    onApplyProposal(proposal);
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId && m.proposal
          ? { ...m, proposal: { ...m.proposal, isApplied: true } }
          : m
      )
    );
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'new-chat',
        role: 'assistant',
        content: 'Chat cleared. How can I assist you with your document today?',
        timestamp: new Date()
      }
    ]);
  };

  return (
    <aside className="w-80 md:w-96 bg-white border-l border-gray-200 flex flex-col h-full shadow-lg z-20 shrink-0 select-text no-print">
      {/* Sidebar Header */}
      <div className="h-12 bg-[#f3f2f1] border-b border-gray-200 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#185abd] text-white rounded-md shadow-2xs">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              Word AI Copilot
              <span className="text-[10px] font-normal px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded">
                {aiSettings.provider}
              </span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={clearChat}
            className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onOpenSettings}
            className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
            title="AI Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors ml-1"
            title="Close Copilot (Ctrl+B)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Context Bar */}
      <div className="px-3 py-1.5 bg-blue-50/60 border-b border-blue-100/80 flex items-center justify-between text-[11px] text-blue-900">
        <div className="flex items-center gap-1.5 truncate">
          <FileText className="w-3.5 h-3.5 text-[#185abd] shrink-0" />
          <span className="truncate">Context: Full Document Attached</span>
        </div>
        {selectedText && (
          <span className="bg-[#185abd] text-white px-1.5 py-0.5 rounded text-[10px] shrink-0 font-medium">
            Selection: {selectedText.split(/\s+/).filter(Boolean).length}w
          </span>
        )}
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-gray-400">
              {msg.role === 'user' ? (
                <>
                  <span>You</span>
                  <User className="w-3 h-3 text-gray-500" />
                </>
              ) : (
                <>
                  <Bot className="w-3 h-3 text-[#185abd]" />
                  <span className="font-medium text-gray-600">Copilot</span>
                </>
              )}
            </div>

            <div
              className={`p-3 rounded-xl max-w-[92%] leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-[#185abd] text-white shadow-xs rounded-tr-none'
                  : 'bg-gray-100 text-gray-800 border border-gray-200/70 shadow-2xs rounded-tl-none'
              }`}
            >
              {msg.content}
            </div>

            {/* Structured Action Proposal Card */}
            {msg.proposal && (
              <div className="mt-2.5 w-full bg-emerald-50/90 border border-emerald-300 rounded-lg p-3 shadow-xs space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-900 font-semibold text-xs">
                    <TableIcon className="w-4 h-4 text-emerald-700" />
                    <span>{msg.proposal.title}</span>
                  </div>
                  {msg.proposal.isApplied && (
                    <span className="bg-emerald-200 text-emerald-800 text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" /> Applied
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-emerald-800">{msg.proposal.description}</p>

                {/* HTML content preview */}
                <div className="bg-white border border-emerald-200 rounded p-2 text-[11px] max-h-36 overflow-y-auto prose prose-xs">
                  <div dangerouslySetInnerHTML={{ __html: msg.proposal.newContent }} />
                </div>

                {!msg.proposal.isApplied ? (
                  <button
                    onClick={() => handleApply(msg.id, msg.proposal!)}
                    className="w-full mt-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Apply to Document
                  </button>
                ) : (
                  <div className="text-[11px] text-emerald-700 italic text-center">
                    Changes applied directly to your document.
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500 italic p-2 bg-gray-50 rounded-lg border border-gray-100">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#185abd]" />
            <span>Copilot is formulating response...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts / AI Action Chips */}
      <div className="px-3 py-2 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center gap-1 text-[11px] text-gray-500 mb-1.5 font-medium">
          <Sparkles className="w-3 h-3 text-[#185abd]" />
          <span>AI Action Shortcuts:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => handleSend('Write a complete engineering project document with abstract, methodology, parameter tables, and findings')}
            className="text-[11px] bg-white border border-blue-200 hover:border-blue-500 hover:bg-blue-50 text-blue-800 px-2.5 py-1 rounded-md font-medium shadow-2xs transition-all flex items-center gap-1"
          >
            <span>✍️</span> Write Project Document
          </button>
          <button
            onClick={() => handleSend('Change this content to make it highly professional, technically rigorous, and impactful')}
            className="text-[11px] bg-white border border-emerald-200 hover:border-emerald-500 hover:bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-md font-medium shadow-2xs transition-all flex items-center gap-1"
          >
            <span>✏️</span> Change This Content
          </button>
          <button
            onClick={() => handleSend('Add a suitable system architecture process flow block diagram for this project')}
            className="text-[11px] bg-white border border-purple-200 hover:border-purple-500 hover:bg-purple-50 text-purple-800 px-2.5 py-1 rounded-md font-medium shadow-2xs transition-all flex items-center gap-1"
          >
            <span>📊</span> Add Suitable Diagram
          </button>
          <button
            onClick={() => handleSend('Organize this page into standard university engineering format with numbered headings and structured tables')}
            className="text-[11px] bg-white border border-amber-200 hover:border-amber-500 hover:bg-amber-50 text-amber-800 px-2.5 py-1 rounded-md font-medium shadow-2xs transition-all flex items-center gap-1"
          >
            <span>📐</span> Organize This Page
          </button>
          <button
            onClick={() => handleSend('/table 4-column experimental parameters and findings')}
            className="text-[11px] bg-white border border-gray-200 hover:border-blue-400 hover:bg-gray-50 text-gray-700 px-2 py-0.5 rounded transition-colors"
          >
            📋 /table
          </button>
          <button
            onClick={() => handleSend('/summary')}
            className="text-[11px] bg-white border border-gray-200 hover:border-blue-400 hover:bg-gray-50 text-gray-700 px-2 py-0.5 rounded transition-colors"
          >
            📑 /summary
          </button>
        </div>
      </div>

      {/* Input Box */}
      <div className="p-3 bg-white border-t border-gray-200">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask Copilot or type /table, /summary... (Press Enter)"
            rows={2}
            className="w-full text-xs p-2.5 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#185abd] focus:border-[#185abd] outline-none resize-none"
          />
          <div className="absolute right-2 bottom-3 flex items-center gap-1">
            <button
              onClick={toggleSpeechRecognition}
              className={`p-1.5 rounded-md transition-colors ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
              }`}
              title={isListening ? 'Stop listening' : 'Voice Typing (Dictation)'}
            >
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="p-1.5 bg-[#185abd] hover:bg-[#12499c] disabled:opacity-40 text-white rounded-md transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

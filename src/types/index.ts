export type AIProvider = 'gemini' | 'openai' | 'anthropic' | 'groq' | 'ollama' | 'demo';

export interface AISettings {
  provider: AIProvider;
  apiKey: string;
  model: string;
  baseUrl?: string;
  temperature: number;
  systemPrompt?: string;
}

export interface ActionProposal {
  id: string;
  type: 'replace_selection' | 'insert_at_cursor' | 'insert_table' | 'full_rewrite' | 'append_section';
  title: string;
  description: string;
  originalText?: string;
  newContent: string;
  isApplied?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  proposal?: ActionProposal;
  isLoading?: boolean;
}

export interface DocumentStats {
  words: number;
  characters: number;
  charactersWithoutSpaces: number;
  paragraphs: number;
  readingTimeMinutes: number;
}

export type PageSize = 'a4' | 'letter';
export type PageOrientation = 'portrait' | 'landscape';
export type PageMargins = 'normal' | 'narrow' | 'moderate' | 'wide';

export interface PageSettings {
  size: PageSize;
  orientation: PageOrientation;
  margins: PageMargins;
  customMargins?: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
  firstLineIndent?: number;
  zoom: number; // 50 - 200%
  isDarkMode?: boolean;
  watermark?: 'none' | 'DRAFT' | 'CONFIDENTIAL' | 'URGENT';
  pageColor?: string;
  pageBorder?: 'none' | 'box' | 'shadow' | 'double';
  columns?: 1 | 2;
}

export interface OutlineItem {
  id: string;
  level: number;
  text: string;
  pos: number;
}

export interface DocumentSnapshot {
  id: string;
  timestamp: Date;
  title: string;
  html: string;
  wordCount: number;
}

export interface ProofreadingIssue {
  id: string;
  type: 'spelling' | 'grammar' | 'tone' | 'clarity';
  originalText: string;
  suggestion: string;
  explanation: string;
}

export interface DocumentAnalysis {
  readabilityScore: number;
  readingLevel: string;
  tone: string;
  issues: ProofreadingIssue[];
}

export interface Template {
  id: string;
  name: string;
  category: 'Business' | 'Academic' | 'Creative' | 'Personal';
  description: string;
  previewColor: string;
  content: string;
}

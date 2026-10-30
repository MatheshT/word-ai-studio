# Word AI Studio 📄✨

A Microsoft Word-grade document authoring environment with an autonomous AI Copilot (VS Code / Cursor style), capable of reading context, generating content, formatting, proofreading, and directly executing edits inside your document.

---

## 🌟 Comprehensive Feature Set (Matching All Microsoft Word Tabs)

### 1. 🖼️ Pictures & Images (Fully Wired & Working)
- **Upload from Computer**: Select any JPG, PNG, GIF, WebP, or SVG from your PC. Automatically converted to Base64 and embedded straight into the document canvas.
- **Web URL**: Paste any public image link.
- **Stock Photos Gallery**: 1-click insert high-resolution curated business and architecture photos.
- **Captions & Alt Text**: Add metadata and captions to every picture.

---

### 2. 📑 Insert Tab
- **Pages**:
  - **Cover Page**: Inserts an executive title block with document title, author, and date.
  - **Blank Page & Page Break**: Inserts clean section breaks.
- **Tables**:
  - Interactive table grid picker (up to 5x5 or custom).
  - Contextual Table Tools (`+Row`, `+Col`, Delete Row, Delete Table).
- **Illustrations**:
  - **Pictures**: Local PC upload + web link + stock photos.
  - **Shapes / Callout Boxes**: Inserts highlighted callout blocks.
  - **Charts & Statistics**: Inserts visual data tables.
- **Text Elements**:
  - **Text Box**: Stylized callout quote.
  - **WordArt**: 3D gradient bold headers.
  - **Date & Time**: Inserts today's formatted date.
- **Symbols**:
  - Math & Currency symbols modal (`±`, `×`, `÷`, `≠`, `≈`, `≤`, `≥`, `√`, `∞`, `∑`, `π`, `$`, `€`, `£`, `¥`, `©`, `®`, `™`).

---

### 3. 🎨 Design Tab
- **Document Formatting Themes**:
  - Office Blue, Executive Slate, Emerald Report, Modern Crimson.
- **Page Background**:
  - **Watermark**: `DRAFT`, `CONFIDENTIAL`, `URGENT`, or `none` (rendered as diagonal watermark across the canvas).
  - **Page Color**: White, Cream / Ivory, Soft Mint, Light Azure, Dark Paper.
  - **Page Borders**: Box, Double, Shadow, or None.

---

### 4. 📐 Layout Tab
- **Page Setup**:
  - Margins: Normal (1"), Narrow (0.5"), Wide (1.5").
  - Orientation: Portrait, Landscape.
  - Size: A4, Letter.
- **Columns**: Toggle between **1 Column** and **2 Columns** (balanced newspaper columns).

---

### 5. 📚 References Tab
- **Table of Contents**: Automatically scans document `h1`, `h2`, `h3` and inserts a formatted, structured Table of Contents!
- **Footnotes**: Inserts superscript `[1]` and formatted footnote notes at the bottom of the document.
- **Citations & Bibliography**: Inserts citation tags and references.

---

### 6. ✉️ Mailings Tab
- **Mail Merge**: Generate personalized memorandums and insert merge fields (`«Full_Name»`, `«Company»`).

---

### 7. 🔍 Review Tab
- **AI Spelling & Grammar**: Real-time document health score (0-100), tone analyzer, and **Auto-Fix All** suggestions.
- **Thesaurus (Synonyms Finder)**: Select any word in the document to view smart synonyms and replace with 1 click.
- **Read Aloud (Speech Synthesis)**: Speaks document text aloud using the browser's speech synthesizer!
- **Translate**: Translate document or selection into Spanish, French, German, Japanese, Chinese, Hindi, and more.

---

### 8. 👁️ View Tab
- **Views**: Read Mode, Print Layout, Web Layout.
- **Focus Mode**: Distraction-free full-screen writing.
- **Switch Modes**: Toggles paper between dark mode and light paper.
- **Show**:
  - ☑ **Ruler**: Millimeter scale `1 · 2 ... · 18` with left/right margin sliders.
  - ☐ **Gridlines**: Toggles grid overlay.
  - ☑ **Navigation Pane**: Word-style left drawer tracking document Headings.
- **Zoom**: 100%, Page Width, Zoom slider (50% – 200%).

---

### 9. ⚡ AI Copilot & VS Code-Style Agent
- **Inline AI (`Ctrl+K`)**:
  - Floating assistant over selection.
  - Diff view: Visual red strikethrough vs emerald green replacement.
  - Natural language prompts (`✨ Fix Grammar`, `💼 Executive Tone`, `✂️ Concise`, `📈 Expand`, `📊 3x3 Table`).
- **Copilot Sidebar (`Ctrl+B`)**:
  - Document awareness: Has full context of your document.
  - **Interactive Action Cards**: Review proposed tables or sections and click **"Apply to Document"** to update your document directly!
  - Slash commands: `/table`, `/summary`, `/proofread`, `/tone`.
- **Multi-Provider AI Settings**:
  - Google Gemini, OpenAI, Groq, Anthropic, Local Ollama, and Built-in Demo mode.

---

## ⌨️ Complete Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| **`Ctrl + K`** | Open Inline AI (Edit selection or generate content) |
| **`Ctrl + B`** | Toggle Copilot Chat Sidebar |
| **`Ctrl + F`** | Open Find in Document |
| **`Ctrl + H`** | Open Replace in Document |
| **`Ctrl + S`** | Save as Microsoft Word `.docx` |
| **`Ctrl + P`** | Export to PDF / Print |
| **`Ctrl + Z` / `Ctrl + Y`** | Undo / Redo |
| **`Ctrl + B` / `Ctrl + I` / `Ctrl + U`** | Bold / Italic / Underline |
| **`Escape`** | Exit Focus Mode / Close modals |

---

## 🚀 Running the App

```bash
cd word-ai-studio
npm run dev
```

Open your browser at **[http://localhost:5173/](http://localhost:5173/)**.

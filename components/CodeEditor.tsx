"use client";

import CodeMirror from "@uiw/react-codemirror";
import { EditorView } from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { rust } from "@codemirror/lang-rust";
import { cpp } from "@codemirror/lang-cpp";
import { html } from "@codemirror/lang-html";
import type { Framework } from "@/lib/frameworks";

function languageExtension(language: Framework["language"]) {
  switch (language) {
    case "typescript":
      return javascript({ jsx: true, typescript: true });
    case "javascript":
      return javascript({ jsx: true });
    case "python":
      return python();
    case "rust":
      return rust();
    case "cpp":
      return cpp();
    case "vue":
    case "html":
      return html();
  }
}

const theme = EditorView.theme(
  {
    "&": {
      backgroundColor: "#171A21",
      color: "#E7E5E0",
      fontSize: "14px",
      height: "100%",
    },
    ".cm-content": { fontFamily: "IBM Plex Mono, ui-monospace, monospace" },
    ".cm-gutters": { backgroundColor: "#171A21", color: "#8B909C", border: "none" },
    "&.cm-focused": { outline: "none" },
  },
  { dark: true }
);

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: Framework["language"];
  readOnly: boolean;
}

export function CodeEditor({ value, onChange, language, readOnly }: CodeEditorProps) {
  return (
    <div
      className={`h-full rounded-md border transition-colors ${
        readOnly ? "border-critical/50" : "border-border"
      }`}
    >
      <CodeMirror
        value={value}
        height="100%"
        theme={theme}
        editable={!readOnly}
        readOnly={readOnly}
        extensions={[languageExtension(language)]}
        onChange={onChange}
        basicSetup={{
          lineNumbers: true,
          foldGutter: false,
          autocompletion: false, // deliberate: no AI/smart assistance during the timed attempt
        }}
      />
    </div>
  );
}

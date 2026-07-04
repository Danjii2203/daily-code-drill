export type FrameworkId =
  | "react"
  | "vue"
  | "angular"
  | "svelte"
  | "nextjs"
  | "nuxt"
  | "node"
  | "python"
  | "django"
  | "rust"
  | "go";

export interface Framework {
  id: FrameworkId;
  label: string;
  /** CodeMirror language extension key, see components/CodeEditor.tsx */
  language: "javascript" | "typescript" | "vue" | "html" | "python" | "rust" | "cpp";
}

// The single source of truth for what a user can pick. Grow this list over
// time — deliberately NOT free text (see product decision log).
export const FRAMEWORKS: Framework[] = [
  { id: "react", label: "React", language: "javascript" },
  { id: "vue", label: "Vue", language: "vue" },
  { id: "angular", label: "Angular", language: "typescript" },
  { id: "svelte", label: "Svelte", language: "javascript" },
  { id: "nextjs", label: "Next.js", language: "javascript" },
  { id: "nuxt", label: "Nuxt", language: "javascript" },
  { id: "node", label: "Node.js", language: "javascript" },
  { id: "python", label: "Python", language: "python" },
  { id: "django", label: "Django", language: "python" },
  { id: "rust", label: "Rust", language: "rust" },
  { id: "go", label: "Go", language: "cpp" }, // no dedicated CM6 Go mode bundled; C-like highlighting is a reasonable stand-in
];

export function getFramework(id: string): Framework | undefined {
  return FRAMEWORKS.find((f) => f.id === id);
}

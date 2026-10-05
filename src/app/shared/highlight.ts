import hljs from 'highlight.js/lib/core';
import python from 'highlight.js/lib/languages/python';

hljs.registerLanguage('python', python);

/** Returns highlighted HTML (hljs escapes the source itself). */
export function highlightPython(code: string): string {
  return hljs.highlight(code, { language: 'python', ignoreIllegals: true }).value;
}

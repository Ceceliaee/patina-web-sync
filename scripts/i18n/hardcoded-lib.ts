export type HardcodedException = { file: string; value: string; owner: string; reason: string };

export function findHardcoded(file: string, content: string, exceptions: readonly HardcodedException[]) {
  const findings: string[] = [];
  const matchingExceptions = exceptions.filter((entry) => entry.file === file);
  const allowed = (value: string) => matchingExceptions.some((entry) => entry.value === value);
  for (const match of content.matchAll(/["'`]([^"'`\n]*[\u3400-\u9fff][^"'`\n]*)["'`]/g)) {
    if (!allowed(match[1])) findings.push(`${file} contains Chinese user-facing text: ${match[1]}`);
  }
  if (file.endsWith(".html")) {
    for (const match of content.matchAll(/>([^<>\n]+)</g)) {
      const value = match[1].trim();
      const generatedFallback = /^\{\{[A-Za-z][A-Za-z0-9.-]+\}\}$/.test(value);
      if (value && /[A-Za-z\u3400-\u9fff]/.test(value) && !generatedFallback && !allowed(value)) {
        findings.push(`${file} contains HTML fallback text: ${value}`);
      }
    }
    for (const match of content.matchAll(/\s(?:aria-label|title|placeholder)="([^"]+)"/g)) {
      if (!/^\{\{[A-Za-z][A-Za-z0-9.-]+\}\}$/.test(match[1]) && !allowed(match[1])) {
        findings.push(`${file} contains hardcoded accessibility text: ${match[1]}`);
      }
    }
  }
  if (/\b(?:OPTIONS_TEXT|POPUP_TEXT)\b/.test(content)) findings.push(`${file} contains a retired locale object.`);
  if (/\blastMessage\b/.test(content) && !file.endsWith("background-status.js")) {
    findings.push(`${file} depends on retired lastMessage state.`);
  }
  return findings;
}

export function staleExceptions(files: ReadonlyMap<string, string>, exceptions: readonly HardcodedException[]) {
  return exceptions
    .filter((entry) => !files.get(entry.file)?.includes(entry.value))
    .map((entry) => `${entry.file} has stale hardcoded exception: ${entry.value}`);
}

export type AssetComparison = {
  matching: string[];
  missing: string[];
  conflicts: Array<{ name: string; expected: string; actual: string }>;
  unexpected: string[];
};

export function compareAssetDigests(
  expected: ReadonlyMap<string, string>,
  actual: ReadonlyMap<string, string>,
): AssetComparison {
  const result: AssetComparison = { matching: [], missing: [], conflicts: [], unexpected: [] };
  for (const [name, expectedHash] of expected) {
    const actualHash = actual.get(name);
    if (!actualHash) result.missing.push(name);
    else if (actualHash.toLowerCase() === expectedHash.toLowerCase()) result.matching.push(name);
    else result.conflicts.push({ name, expected: expectedHash, actual: actualHash });
  }
  for (const name of actual.keys()) {
    if (!expected.has(name)) result.unexpected.push(name);
  }
  result.matching.sort();
  result.missing.sort();
  result.conflicts.sort((left, right) => left.name.localeCompare(right.name));
  result.unexpected.sort();
  return result;
}

export function canonicalChecksumText(digests: ReadonlyMap<string, string>) {
  return `${[...digests]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([name, digest]) => `${digest.toLowerCase()}  ${name}`)
    .join("\n")}\n`;
}

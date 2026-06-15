/**
 * Manual mock for tailwind-merge.
 * Required because tailwind-merge v3 tries to resolve Tailwind CSS config
 * at import time, which fails in JSDOM/Vitest environments.
 * This mock provides functionally equivalent implementations for testing,
 * including basic Tailwind conflict resolution (last class wins).
 */

/**
 * Extracts the Tailwind utility group prefix from a class name.
 * e.g. "px-4" → "px", "text-red-500" → "text", "bg-blue-500" → "bg"
 */
function getTailwindGroup(className: string): string | null {
  // Handle responsive/state prefixes like "hover:px-4", "md:text-red-500"
  const withoutVariant = className.replace(/^[a-z-]+:/, '');

  // Match known Tailwind utility groups that conflict
  const conflictPatterns = [
    /^(px)-/,
    /^(py)-/,
    /^(pt)-/,
    /^(pb)-/,
    /^(pl)-/,
    /^(pr)-/,
    /^(p)-\d/,
    /^(mx)-/,
    /^(my)-/,
    /^(mt)-/,
    /^(mb)-/,
    /^(ml)-/,
    /^(mr)-/,
    /^(m)-\d/,
    /^(text)-(red|green|blue|yellow|purple|pink|indigo|gray|white|black|slate|zinc|neutral|stone|amber|lime|emerald|teal|cyan|sky|violet|fuchsia|rose)-/,
    /^(text)-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)$/,
    /^(bg)-(red|green|blue|yellow|purple|pink|indigo|gray|white|black|slate|zinc|neutral|stone|amber|lime|emerald|teal|cyan|sky|violet|fuchsia|rose)-/,
    /^(font)-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/,
    /^(w)-/,
    /^(h)-/,
    /^(rounded)/,
    /^(shadow)/,
    /^(opacity)-/,
    /^(z)-/,
    /^(flex-)/,
    /^(grid-cols)-/,
    /^(gap)-/,
    /^(leading)-/,
    /^(tracking)-/,
  ];

  for (const pattern of conflictPatterns) {
    const match = withoutVariant.match(pattern);
    if (match) {
      // Return the full prefix up to the value separator
      const prefix = match[1] ?? match[0];
      return prefix;
    }
  }

  return null;
}

/**
 * Merges class names with basic Tailwind conflict resolution.
 * Later classes take precedence over earlier ones in the same utility group.
 */
export function twMerge(...inputs: (string | undefined | null | false | 0 | Record<string, boolean> | (string | undefined | null | false)[])[]): string {
  // Flatten all inputs into individual class strings
  const allClasses: string[] = [];

  function processInput(input: unknown): void {
    if (!input) return;
    if (typeof input === 'string') {
      allClasses.push(...input.split(/\s+/).filter(Boolean));
    } else if (Array.isArray(input)) {
      input.forEach(processInput);
    } else if (typeof input === 'object') {
      Object.entries(input as Record<string, boolean>).forEach(([cls, active]) => {
        if (active) allClasses.push(cls);
      });
    }
  }

  inputs.forEach(processInput);

  // Resolve conflicts: last class in a group wins
  const groupToClass = new Map<string, { cls: string; idx: number }>();
  const ungrouped: { cls: string; idx: number }[] = [];

  allClasses.forEach((cls, idx) => {
    const group = getTailwindGroup(cls);
    if (group) {
      groupToClass.set(group, { cls, idx });
    } else {
      ungrouped.push({ cls, idx });
    }
  });

  // Combine ungrouped + grouped, preserving order
  const result: { cls: string; idx: number }[] = [
    ...ungrouped,
    ...Array.from(groupToClass.values()),
  ];

  result.sort((a, b) => a.idx - b.idx);

  return result.map((r) => r.cls).join(' ');
}

/**
 * Creates an extended merge function with custom config.
 * In tests, returns the same twMerge function.
 */
export function extendTailwindMerge(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _config: unknown,
): (...inputs: (string | undefined | null | false)[]) => string {
  return (...inputs) => twMerge(...inputs);
}

/**
 * Merges two configs - no-op in test environment.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function mergeConfigs<T>(baseConfig: T, _extension: unknown): T {
  return baseConfig;
}

// eslint-disable-next-line import/no-anonymous-default-export
export default { twMerge, extendTailwindMerge, mergeConfigs };

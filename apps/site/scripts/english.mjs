// English writing rules. Sources and the reason for each rule: apps/site/AGENTS.md.
// A check can find a pattern; it cannot prove that the English is natural or correct.

import { japanese } from './japanese.mjs';

// The language switch names Japanese in Japanese; nothing else on an English page may.
const allowedJapanese = new Set(['日本語']);
// Exact names of formats and encodings, which readers search for. Each is explained at its first use on a page.
// The Japanese rule (scripts/no-abbreviations.cjs) allows only AST and HIR.
export const englishAbbreviations = new Set(['AST', 'HIR', 'CSS', 'HTML', 'JSON', 'UTF-8', 'UTF-16', 'ASCII']);
const abbreviation = /(?<![\w`])[A-Z]{2,}(?:-\d+)?(?![\w`])/g;
const MAX_SENTENCE_WORDS = 40;

const banned = [
	[/\bsimply\b/i, 'simply'],
	[/\b(?:it's|it is) (?:that )?(?:simple|easy)\b|\beasy\b|\beasily\b/i, 'easy'],
	[/\bplease\b/i, 'please'],
	[/\bat this time\b/i, 'at this time'],
	[/\blet's\b|\blet us\b/i, "let's"],
	[/\bclick here\b/i, 'click here'],
	[/\btl;dr\b|\bymmv\b/i, 'internet abbreviation'],
	[/\bcoming soon\b/i, 'pre-announcement'],
	[/\b(?:blazing(?:ly)?|seamless(?:ly)?|leverag(?:e|es|ing)|robust|powerful|cutting-edge|revolutionary|game-chang\w*|best-in-class|world-class|lightning)\b/i, 'promotional word'],
	[/\bdelve\b|\bin today's\b|\bit's worth noting\b|\bit is worth noting\b/i, 'filler phrase']
];

// Proper nouns that may start with a capital in a sentence-case heading.
const properNouns = new Set([
	'Svelte', 'Vue', 'Vapor', 'Rust', 'TypeScript', 'JavaScript', 'ESLint', 'Prettier', 'Cargo', 'Node', 'WebAssembly',
	'GitHub', 'Vec', 'Linux', 'Chrome', 'Unicode', 'Rayon', 'Vite', 'SvelteKit', 'Valgrind', 'English', 'Japanese', 'I'
]);

const withoutCode = text => text.replace(/`[^`]*`/g, '`code`');

function headingProblems(heading) {
	const problems = [];
	if (/[.:]$/.test(heading.trim())) problems.push('a heading must not end with a period or a colon');
	const words = withoutCode(heading).split(/\s+/).slice(1).filter((word) => /^[A-Z][a-z]{3,}$/.test(word) && !properNouns.has(word));
	if (words.length >= 2) problems.push(`use sentence case in headings (${words.join(', ')})`);
	return problems;
}

/** Problems in one passage. `heading` is true for titles that are not marked with `#`. */
export function englishProblems(passage, { heading = false } = {}) {
	const problems = [];
	const text = passage.trim();
	if (japanese.test(text) && !allowedJapanese.has(text)) problems.push('Japanese text on an English page');
	const plain = withoutCode(text);
	for (const [pattern, name] of banned) if (pattern.test(plain)) problems.push(`avoid "${name}"`);
	if (/!(?:\s|$)/.test(plain)) problems.push('avoid exclamation marks');
	for (const match of plain.matchAll(abbreviation)) {
		if (!englishAbbreviations.has(match[0])) problems.push(`spell out the abbreviation "${match[0]}"`);
	}
	const marked = /^(#{1,6}) (.*)$/.exec(text);
	if (marked) problems.push(...headingProblems(marked[2]));
	else if (heading) problems.push(...headingProblems(text));
	for (const sentence of plain.split(/(?<=[.?])\s+/)) {
		const words = sentence.split(/\s+/).filter((word) => /\w/.test(word)).length;
		if (words > MAX_SENTENCE_WORDS) problems.push(`sentence has ${words} words; the limit is ${MAX_SENTENCE_WORDS}`);
	}
	return problems;
}

/** Link text that does not name its target. */
export function vagueLinks(source) {
	return [...source.matchAll(/<a\b[^>]*>\s*(here|click here|this link|this page|link|more|read more)\s*<\/a>/gi)].map((match) => ({
		line: source.slice(0, match.index).split('\n').length,
		text: match[1]
	}));
}

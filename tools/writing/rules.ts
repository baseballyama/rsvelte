// The English rules, imported directly: textlint's config loader cannot load ESM-only rules and drops them without an error.

import noInvalidControlCharacter from '@textlint-rule/textlint-rule-no-invalid-control-character';
import noUnmatchedPair from '@textlint-rule/textlint-rule-no-unmatched-pair';
import abbrWithinParentheses from 'textlint-rule-abbr-within-parentheses';
import alex from 'textlint-rule-alex';
import commonMisspellings from 'textlint-rule-common-misspellings';
import diacritics from 'textlint-rule-diacritics';
import enCapitalization from 'textlint-rule-en-capitalization';
import enMaxWordCount from 'textlint-rule-en-max-word-count';
import maxComma from 'textlint-rule-max-comma';
import noEmptySection from 'textlint-rule-no-empty-section';
import noNfd from 'textlint-rule-no-nfd';
import noStartDuplicatedConjunction from 'textlint-rule-no-start-duplicated-conjunction';
import noZeroWidthSpaces from 'textlint-rule-no-zero-width-spaces';
import spelling from 'textlint-rule-spelling';
import stopWords from 'textlint-rule-stop-words';
import terminology from 'textlint-rule-terminology';
import unexpandedAcronym from 'textlint-rule-unexpanded-acronym';
import type { loadTextlintrc } from 'textlint';
import writeGood from 'textlint-rule-write-good';
import { acronyms, lowercaseNames, words } from './words.ts';

// textlint's rule types live in @textlint/kernel, which this package does not depend on directly.
type Descriptor = Awaited<ReturnType<typeof loadTextlintrc>>;
type KernelRule = ReturnType<Descriptor['rule']['toKernelRulesFormat']>[number];

// Babel-built CommonJS rules arrive as `{ default: rule }` through the ESM import.
const unwrap = (module: unknown): unknown =>
	typeof module === 'object' && module !== null && 'default' in module
		? unwrap(module.default)
		: module;

const table: { ruleId: string; rule: unknown; options: KernelRule['options'] }[] = [
	// "only" and "exactly" state a limit, which is the meaning, not a weak adverb.
	{
		ruleId: 'write-good',
		rule: writeGood,
		options: { whitelist: ['only', 'exactly', 'directly'] },
	},
	// Profanity guesses flag "failed" and "Japanese"; the listed words are technical terms here.
	{
		ruleId: 'alex',
		rule: alex,
		options: {
			profanitySureness: 2,
			allow: ['host-hostess', 'hostesses-hosts', 'invalid', 'whitespace', 'special', 'execution'],
		},
	},
	// README is the file's name, and "stylesheet" is how CSS documentation spells it.
	{
		ruleId: 'terminology',
		rule: terminology,
		options: { exclude: ['readme(s)?', 'style-?sheet(s)?'] },
	},
	{ ruleId: 'common-misspellings', rule: commonMisspellings, options: true },
	{ ruleId: 'en-capitalization', rule: enCapitalization, options: { allowWords: lowercaseNames } },
	{ ruleId: 'stop-words', rule: stopWords, options: true },
	{ ruleId: 'no-start-duplicated-conjunction', rule: noStartDuplicatedConjunction, options: true },
	{ ruleId: 'en-max-word-count', rule: enMaxWordCount, options: { max: 30 } },
	{ ruleId: 'diacritics', rule: diacritics, options: true },
	{ ruleId: 'abbr-within-parentheses', rule: abbrWithinParentheses, options: true },
	{ ruleId: 'unexpanded-acronym', rule: unexpandedAcronym, options: { ignore_acronyms: acronyms } },
	{ ruleId: 'no-empty-section', rule: noEmptySection, options: true },
	{
		ruleId: 'spelling',
		rule: spelling,
		options: {
			language: 'en',
			skipPatterns: [`/\\b(?:${words.join('|')})(?:'s)?\\b/g`, `/\\b\\w+'s\\b/g`],
		},
	},
	{ ruleId: 'max-comma', rule: maxComma, options: { max: 3 } },
	{ ruleId: 'no-unmatched-pair', rule: noUnmatchedPair, options: true },
	{ ruleId: 'no-zero-width-spaces', rule: noZeroWidthSpaces, options: true },
	{ ruleId: 'no-nfd', rule: noNfd, options: true },
	{ ruleId: 'no-invalid-control-character', rule: noInvalidControlCharacter, options: true },
];

export const rules = table.map(({ ruleId, rule, options }) => ({
	ruleId,
	rule: unwrap(rule) as KernelRule['rule'],
	options,
}));

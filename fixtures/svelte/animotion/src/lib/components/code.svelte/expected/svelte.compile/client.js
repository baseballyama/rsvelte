import 'svelte/internal/disclose-version';
import { createHighlighter } from 'shiki';
import * as $ from 'svelte/internal/client';
import Action from '$lib/components/action.svelte';
import Code from '$lib/components/code.svelte';
import { codeToKeyedTokens, createMagicMoveMachine } from '@shikijs/magic-move/core';
import { MagicMoveRenderer } from '@shikijs/magic-move/renderer';
import { getPresentation } from './store.svelte.js';
import '../styles/shiki.css';

const highlighterCache = new Map();

function getHighlighter(theme, lang) {
	const key = `${theme}-${lang}`;

	if (!highlighterCache.has(key)) {
		highlighterCache.set(key, createHighlighter({ themes: [theme], langs: [lang] }));
	}

	return highlighterCache.get(key);
}

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'code',
	'codes',
	'lang',
	'theme',
	'options',
	'autoIndent',
	'ref'
]);

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<pre></pre>`);

export default function Code_1($$anchor, $$props) {
	$.push($$props, true);

	let theme = $.prop($$props, 'theme', 3, 'poimandres'),
		options = $.prop($$props, 'options', 19, () => ({})),
		autoIndent = $.prop($$props, 'autoIndent', 3, true),
		props = $.rest_props($$props, rest_excludes);

	let container = $.state(void 0);
	let self = $.state(void 0);
	let highlighter;
	let machine;
	let renderer;
	let ready = false;
	let currentCode = '';
	let currentTokens = [];

	const is = {
		htmlEl: (el) => el instanceof HTMLElement,
		token: (el) => el.className.includes('shiki-magic-move-item'),
		newLine: (el) => el.tagName === 'BR'
	};

	function getRevealScale() {
		const deck = getPresentation().slides;

		return deck?.getScale?.() ?? 1;
	}

	// splits bracket characters for finer-grained selection
	function splitPunctuationTokens(result) {
		const brackets = /[{}\[\]()]/g;
		const newTokens = [];

		for (const token of result.tokens) {
			if (token.content === '\n') {
				newTokens.push(token);

				continue;
			}

			const matches = [...token.content.matchAll(brackets)];

			if (matches.length === 0) {
				newTokens.push(token);

				continue;
			}

			const splitPositions = matches.map((m) => m.index);
			let lastEnd = 0;
			const splits = [];

			for (const pos of splitPositions) {
				if (pos > lastEnd) {
					splits.push({
						content: token.content.slice(lastEnd, pos),
						offset: token.offset + lastEnd
					});
				}

				splits.push({
					content: token.content.slice(pos, pos + 1),
					offset: token.offset + pos
				});

				lastEnd = pos + 1;
			}

			if (lastEnd < token.content.length) {
				splits.push({
					content: token.content.slice(lastEnd),
					offset: token.offset + lastEnd
				});
			}

			for (let i = 0; i < splits.length; i++) {
				newTokens.push({
					...token,
					content: splits[i].content,
					offset: splits[i].offset,
					key: i === 0 ? token.key : `${token.key}-${i}`
				});
			}
		}

		return { ...result, tokens: newTokens };
	}

	/**
	 * removes common leading indentation from code
	 */
	function indent(text) {
		const trimmed = text.trim();
		const lines = trimmed.split('\n');

		if (lines.length === 1) return trimmed;

		const firstIndented = lines.find((line) => (/^[\t ]/).test(line));

		if (!firstIndented) return trimmed;

		const isTabs = firstIndented[0] === '\t';

		if (isTabs) {
			const common = lines.map((line) => line.match(/^(\t+)/)?.[1] || '').filter((tabs) => tabs.length > 0).sort((a, b) => a.length - b.length)[0];

			if (!common || common === '\t') return trimmed;

			return lines.map((line) => line.replace(common, '')).join('\n');
		} else {
			const common = lines.map((line) => line.match(/^( +)/)?.[1] || '').filter((spaces) => spaces.length > 0).sort((a, b) => a.length - b.length)[0];

			if (!common || common === ' ') return trimmed;

			return lines.map((line) => line.replace(common, '')).join('\n');
		}
	}

	/**
	 * modified indent mostly used by replace
	 */
	function dedent(text) {
		const lines = text.split('\n');
		let baseIndent = '';

		for (const line of lines) {
			if (line.trim() === '') continue;

			baseIndent = line.match(/^(\s*)/)?.[1] ?? '';

			break;
		}

		if (!baseIndent) return text.trim();

		const result = lines.map((line) => {
			if (line.trim() === '') return '';
			if (line.startsWith(baseIndent)) return line.slice(baseIndent.length);

			return line.trimStart();
		});

		while (result.length && result[0].trim() === '') result.shift();
		while (result.length && result[result.length - 1].trim() === '') result.pop();

		return result.join('\n');
	}

	function parseSelection(raw) {
		let line = null;
		let index = null;
		let pattern = raw.trim();
		const indexMatch = pattern.match(/:(\d+)$/);

		if (indexMatch) {
			index = parseInt(indexMatch[1], 10);
			pattern = pattern.slice(0, -indexMatch[0].length).trim();
		}

		const parts = pattern.split(/\s+/);

		if (parts.length > 0 && (/^\d+$/).test(parts[0])) {
			line = parseInt(parts[0], 10);
			pattern = parts.slice(1).join(' ');
		}

		return { line, index, pattern };
	}

	function stripWhitespace(code) {
		const stripped = [];
		const positions = [];

		for (let i = 0; i < code.length; i++) {
			if (!(/\s/).test(code[i])) {
				stripped.push(code[i]);
				positions.push(i);
			}
		}

		return { stripped: stripped.join(''), positions };
	}

	function findOccurrences(code, pattern, line, index) {
		const { stripped: strippedSource, positions } = stripWhitespace(code);
		const strippedPattern = pattern.replace(/\s+/g, '');

		if (!strippedPattern) return [];

		const occurrences = [];
		let searchPos = 0;

		while (searchPos < strippedSource.length) {
			const found = strippedSource.indexOf(strippedPattern, searchPos);

			if (found === -1) break;

			const start = positions[found];
			const end = positions[found + strippedPattern.length - 1] + 1;

			occurrences.push({ start, end });
			searchPos = found + 1;
		}

		if (occurrences.length === 0) return [];

		// filter by line if specified
		if (line !== null) {
			const lines = code.split('\n');
			let charPos = 0;
			const lineRanges = [];

			for (let i = 0; i < lines.length; i++) {
				lineRanges.push({ start: charPos, end: charPos + lines[i].length });
				charPos += lines[i].length + 1;
			}

			const lineIndex = line - 1;

			if (lineIndex >= 0 && lineIndex < lineRanges.length) {
				const targetRange = lineRanges[lineIndex];

				return occurrences.filter((occ) => occ.start >= targetRange.start && occ.end <= targetRange.end);
			}
		}

		// apply index if specified
		if (index !== null) {
			const idx = index;

			return occurrences[idx] ? [occurrences[idx]] : [];
		}

		return occurrences;
	}

	function getTokenOffsets(tokens, occurrences) {
		const offsets = new Set();

		for (const occ of occurrences) {
			for (const token of tokens) {
				const tokenStart = token.offset;
				const tokenEnd = token.offset + token.content.length;

				if (tokenEnd > occ.start && tokenStart < occ.end) {
					offsets.add(token.offset);
				}
			}
		}

		return offsets;
	}

	function addLineNumbers(tokens) {
		let line = 1;

		return tokens.map((token) => {
			const tokenWithLine = { ...token, line };

			if (token.content === '\n') line++;

			return tokenWithLine;
		});
	}

	function createRange(start, end) {
		return Array.from({ length: end - start + 1 }, (_, i) => start + i);
	}

	function getLines(range) {
		if (range === '*') return [];

		return range.split(',').flatMap((part) => {
			if (part.includes('-')) {
				const [start, end] = part.split('-').map(Number);

				return createRange(start, end);
			}

			return [+part];
		});
	}

	function merge(strings, expressions) {
		let result = '';

		for (let i = 0; i < strings.length; i++) {
			result += strings[i];

			if (expressions[i]) result += expressions[i].trim();
		}

		return result;
	}

	function transition(el, selected) {
		const { promise, resolve } = Promise.withResolvers();
		const willTransition = !selected && el.classList.contains('selected') || selected && el.classList.contains('deselected') || !selected && !el.classList.contains('deselected');

		if (willTransition) {
			el.ontransitionend = resolve;
		} else {
			resolve('finished');
		}

		el.classList.toggle('selected', selected);
		el.classList.toggle('deselected', !selected);

		return promise;
	}

	function applyToTokens(container, tokens, selectedOffsets, mode) {
		const children = container.children;
		const promises = [];
		let tokenIndex = 0;

		for (const el of children) {
			if (!is.htmlEl(el)) continue;

			if (is.token(el)) {
				const token = tokens[tokenIndex];

				tokenIndex++;

				if (token) {
					const isSelected = selectedOffsets.has(token.offset);

					if (mode === 'replace') {
						promises.push(transition(el, isSelected));
					} else if (mode === 'add' && isSelected) {
						promises.push(transition(el, true));
					}
				}
			}

			if (is.newLine(el)) {
				tokenIndex++;
			}
		}

		return Promise.all(promises);
	}

	async function init() {
		if (!$.get(container)) return;

		highlighter = await getHighlighter(theme(), $$props.lang);

		machine = createMagicMoveMachine(
			(code) => {
				const result = codeToKeyedTokens(highlighter, code, { lang: $$props.lang, theme: theme() }, options().lineNumbers);

				return splitPunctuationTokens(result);
			},
			options()
		);

		renderer = new MagicMoveRenderer($.get(container));
		Object.assign(renderer.options, { ...options(), globalScale: getRevealScale() });

		const indentedCode = autoIndent() ? indent($$props.code) : $$props.code;

		currentCode = indentedCode;

		const result = machine.commit(indentedCode);

		currentTokens = addLineNumbers(result.current.tokens);
		renderer.render(result.current);
		ready = true;
	}

	async function render(code) {
		if (!ready) return;

		const indentedCode = autoIndent() ? indent(code) : code;

		currentCode = indentedCode;

		const result = machine.commit(indentedCode);

		if (result.previous) renderer.replace(result.previous);

		currentTokens = addLineNumbers(result.current.tokens);
		renderer.options.globalScale = getRevealScale();
		await renderer.render(result.current);
	}

	/**
	 * updates the code with animation
	 */
	function update(strings, ...expressions) {
		return expressions.length > 0
			? render(merge(strings, expressions))
			: render(strings[0]);
	}

	/**
	 * appends code to the current code with animation
	 */
	function append(strings, ...expressions) {
		const newCode = expressions.length > 0 ? merge(strings, expressions) : strings[0];
		const dedentedCode = autoIndent() ? indent(newCode) : newCode;

		return render(currentCode + '\n\n' + dedentedCode);
	}

	/**
	 * removes lines by line number with animation
	 * supports: single line (5), range (5-7), multiple (5,7,9), or combinations (5,7-10)
	 */
	function remove(strings, ...expressions) {
		const input = expressions.length > 0 ? merge(strings, expressions) : strings[0];
		const lineNumbers = getLines(input.trim());

		if (lineNumbers.length === 0) {
			console.warn('remove: invalid line range');

			return Promise.resolve();
		}

		const lines = currentCode.split('\n');
		const sortedLines = [...lineNumbers].sort((a, b) => b - a);

		for (const lineNum of sortedLines) {
			if (lineNum >= 1 && lineNum <= lines.length) {
				lines.splice(lineNum - 1, 1);
			}
		}

		return render(lines.join('\n'));
	}

	function detectIndentStyle(lines) {
		for (const line of lines) {
			const match = line.match(/^(\s+)/);

			if (match) {
				const whitespace = match[1];

				if (whitespace.includes('\t')) {
					return { char: '\t', size: 1 };
				}

				const spaces = whitespace.length;

				return { char: ' ', size: spaces <= 2 ? 2 : 4 };
			}
		}

		return { char: ' ', size: 2 };
	}

	/**
	 * inserts code at a specific line with animation
	 * format: `<lineNumber>:<indentLevel> <code>` where line number is 1-indexed
	 * indentLevel is optional (defaults to 0)
	 */
	function insert(strings, ...expressions) {
		const input = expressions.length > 0 ? merge(strings, expressions) : strings[0];
		const match = input.match(/^(\d+)(?::(\d+))?[ \t]*/);

		if (!match) {
			console.warn('insert: line number required at start of code');

			return Promise.resolve();
		}

		const lineNumber = parseInt(match[1], 10);
		const indentLevel = match[2] ? parseInt(match[2], 10) : 0;
		const codeFragment = input.slice(match[0].length);

		// preserve leading newlines before dedenting
		const leadingNewlines = codeFragment.match(/^\n*/)?.[0].length ?? 0;

		const codeWithoutLeadingNewlines = codeFragment.slice(leadingNewlines);

		const dedentedCode = autoIndent()
			? indent(codeWithoutLeadingNewlines)
			: codeWithoutLeadingNewlines;

		const lines = currentCode.split('\n');
		const { char, size } = detectIndentStyle(lines);

		const actualIndent = char === '\t'
			? ('\t').repeat(indentLevel)
			: (' ').repeat(indentLevel * size);

		const codeLines = dedentedCode.split('\n');
		const indentedLines = codeLines.map((line) => line ? actualIndent + line : line);
		const blankLines = Array(leadingNewlines).fill('');

		lines.splice(lineNumber - 1, 0, ...blankLines, ...indentedLines);

		return render(lines.join('\n'));
	}

	/**
	 * replaces matching code with new code with animation
	 */
	function replace(from, to) {
		const dedentedFrom = autoIndent() ? dedent(from) : from;
		const dedentedTo = autoIndent() ? dedent(to) : to;
		const [occ] = findOccurrences(currentCode, dedentedFrom, null, 0);

		if (!occ) {
			console.warn('replace: pattern not found');

			return Promise.resolve();
		}

		const lineStart = currentCode.lastIndexOf('\n', occ.start - 1) + 1;
		const lineIndent = currentCode.slice(lineStart).match(/^\s*/)?.[0] ?? '';
		const toLines = dedentedTo.split('\n');
		const reindentedTo = toLines.map((line, i) => i === 0 ? line : line ? lineIndent + line : line).join('\n');

		return render(currentCode.slice(0, occ.start) + reindentedTo + currentCode.slice(occ.end));
	}

	/**
	 * highlights specific lines, or all lines if `*` is passed
	 */
	function selectLines(strings, ...expressions) {
		if (!$.get(container)) return;

		const range = expressions.length > 0 ? merge(strings, expressions) : strings[0];
		const lines = getLines(range);
		const children = $.get(container).children;
		const promises = [];
		let currentLine = 1;

		for (const el of children) {
			if (!is.htmlEl(el)) return;

			if (is.token(el)) {
				const selected = lines.length === 0 ? true : lines.includes(currentLine);

				promises.push(transition(el, selected));
			}

			if (is.newLine(el)) currentLine++;
		}

		return Promise.all(promises);
	}

	/**
	 * adds specific lines to the current selection without deselecting others
	 */
	function selectLinesAdd(strings, ...expressions) {
		if (!$.get(container)) return;

		const range = expressions.length > 0 ? merge(strings, expressions) : strings[0];
		const lines = getLines(range);
		const children = $.get(container).children;
		const promises = [];
		let currentLine = 1;

		for (const el of children) {
			if (!is.htmlEl(el)) return;

			if (is.token(el)) {
				const shouldSelect = lines.length === 0 ? true : lines.includes(currentLine);

				if (shouldSelect) {
					promises.push(transition(el, true));
				}
			}

			if (is.newLine(el)) currentLine++;
		}

		return Promise.all(promises);
	}

	/**
	 * scrolls to make a specific line visible
	 */
	function scrollToLine(strings, ...expressions) {
		if (!$.get(container)) return;

		const raw = expressions.length > 0 ? merge(strings, expressions) : strings[0];
		const line = parseInt(raw.trim());

		if (isNaN(line) || line < 1) return;

		let tokenIndex = 0;
		let targetElement = null;

		/*
		 * shiki inserts an anchor span at index 0, then renders
		 * every token (including \n as <br>) as a direct child.
		 * we skip the anchor and map each remaining child 1:1 with currentTokens
		 * to find the first token element on the target line.
		 */
		for (let i = 1; i < $.get(container).children.length; i++) {
			const el = $.get(container).children[i];

			if (!is.htmlEl(el)) continue;
			if (tokenIndex >= currentTokens.length) break;

			const token = currentTokens[tokenIndex];

			tokenIndex++;

			if (is.token(el) && token.line === line) {
				targetElement = el;

				break;
			}
		}

		if (!targetElement) return;

		return new Promise((resolve) => {
			/*
			 * calculate where the target would be when centered so we can
			 * skip the animation if we're already there
			 */
			const containerRect = $.get(container).getBoundingClientRect();

			const targetRect = targetElement.getBoundingClientRect();
			const targetOffsetTop = targetRect.top - containerRect.top + $.get(container).scrollTop;
			const centerOffset = containerRect.height / 2 - targetRect.height / 2;
			const scrollPosition = Math.max(0, targetOffsetTop - centerOffset);

			if (Math.abs($.get(container).scrollTop - scrollPosition) < 1) {
				resolve();

				return;
			}

			targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

			let resolved = false;

			const done = () => {
				if (resolved) return;

				resolved = true;
				resolve();
			};

			$.get(container).addEventListener('scrollend', done, { once: true });
			setTimeout(done, 500);
		});
	}

	/**
	 * selects tokens matching a pattern, optionally filtered by line number or index
	 */
	function select(strings, ...expressions) {
		if (!$.get(container) || !currentCode) return;

		const raw = expressions.length > 0 ? merge(strings, expressions) : strings[0];
		const { line, index, pattern } = parseSelection(raw);

		if (!pattern) return;

		const occurrences = findOccurrences(currentCode, pattern, line, index);
		const selectedOffsets = getTokenOffsets(currentTokens, occurrences);

		return applyToTokens($.get(container), currentTokens, selectedOffsets, 'replace');
	}

	/**
	 * adds to the current selection without deselecting other tokens
	 */
	function selectAdd(strings, ...expressions) {
		if (!$.get(container) || !currentCode) return;

		const raw = expressions.length > 0 ? merge(strings, expressions) : strings[0];
		const { line, index, pattern } = parseSelection(raw);

		if (!pattern) return;

		const occurrences = findOccurrences(currentCode, pattern, line, index);
		const selectedOffsets = getTokenOffsets(currentTokens, occurrences);

		return applyToTokens($.get(container), currentTokens, selectedOffsets, 'add');
	}

	/**
	 * @deprecated use `select` instead
	 */
	function selectToken(strings, ...expressions) {
		console.warn('selectToken is deprecated, use select instead');

		return select(strings, ...expressions);
	}

	$.user_effect(() => {
		init();
	});

	$.user_effect(() => {
		$$props.ref?.($.get(self));
	});

	var $$exports = {
		indent,
		update,
		append,
		remove,
		insert,
		replace,
		selectLines,
		selectLinesAdd,
		scrollToLine,
		select,
		selectAdd,
		selectToken
	};

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			$.bind_this(
				Code(node_1, $.spread_props(
					{
						get code() {
							return $$props.codes[0];
						},

						get lang() {
							return $$props.lang;
						},

						get theme() {
							return theme();
						},

						get options() {
							return options();
						},

						get autoIndent() {
							return autoIndent();
						}
					},
					() => props
				)),
				($$value) => $.set(self, $$value, true),
				() => $.get(self)
			);

			var node_2 = $.sibling(node_1, 2);

			$.each(node_2, 17, () => $$props.codes, $.index, ($$anchor, _, i) => {
				var fragment_2 = $.comment();
				var node_3 = $.first_child(fragment_2);

				{
					var consequent = ($$anchor) => {
						Action($$anchor, {
							do: () => $.get(self).update`${$$props.codes[i + 1]}`,
							undo: () => $.get(self).update`${$$props.codes[i]}`
						});
					};

					$.if(node_3, ($$render) => {
						if ($$props.codes[i + 1]) $$render(consequent);
					});
				}

				$.append($$anchor, fragment_2);
			});

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var pre = root_1();

			$.attribute_effect(pre, () => ({
				...props,
				class: `shiki-magic-move-container ${$$props.class ?? ''}`
			}));

			$.bind_this(pre, ($$value) => $.set(container, $$value), () => $.get(container));
			$.append($$anchor, pre);
		};

		$.if(node, ($$render) => {
			if ($$props.codes) $$render(consequent_1); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}
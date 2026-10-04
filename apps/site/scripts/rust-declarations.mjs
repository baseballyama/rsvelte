import { scan } from '../src/lib/build/rust-items.ts';

const ITEMS = new Set(['fn', 'struct', 'enum', 'trait', 'type', 'const', 'static', 'mod', 'union']);
const NOT_BINDINGS = new Set(['mut', 'ref', 'box', 'true', 'false', 'in', 'if', 'self', 'Self', 'crate', 'super', '_']);
const EXPRESSION_START_KEYWORDS = new Set(['return', 'move', 'break', 'yield', 'in', 'async', 'static', 'box', 'else']);
const PAIRS = new Set(['::', '=>', '->', '..', '==', '!=', '<=', '>=', '&&', '||']);
const OPENING = new Set(['(', '[', '{', '<']);
const CLOSING = new Set([')', ']', '}', '>']);
const CLOSER = { '(': ')', '[': ']', '{': '}', '<': '>' };

/** Names that a Rust file declares, with their lines. Uses of names from std or dependencies are not declarations. */
export function rustDeclarations(source) {
	const tokens = tokenize(source);
	const found = [];
	const add = index => found.push({ name: tokens[index].text.replace(/^'/, ''), line: tokens[index].line });
	const traitImplementations = [];
	for (let index = 0; index < tokens.length; index++) {
		const token = tokens[index];
		const previous = tokens[index - 1]?.text;
		if (token.text === 'impl') {
			index = implementationHeader(tokens, index, add, traitImplementations);
		} else if (token.text === 'use') {
			index = useAliases(tokens, index, add);
		} else if (token.text === 'macro_rules' && tokens[index + 1]?.text === '!') {
			add(index + 2);
		} else if (ITEMS.has(token.text) && tokens[index + 1]?.kind === 'identifier' && previous !== '.') {
			item(tokens, index, add, traitImplementations);
		} else if (token.text === 'for' && tokens[index + 1]?.text === '<') {
			index = genericParameters(tokens, index + 1, add);
		} else if (token.text === 'let' || token.text === 'for') {
			statementPattern(tokens, index, add);
		} else if (token.text === '|' && !endsExpression(tokens[index - 1])) {
			index = closureParameters(tokens, index, add);
		} else if (token.text === 'match' && previous !== '#') {
			matchArms(tokens, index, add);
		} else if (token.kind === 'lifetime' && tokens[index + 1]?.text === ':'
			&& ['loop', 'while', 'for', '{'].includes(tokens[index + 2]?.text)) {
			add(index);
		}
	}
	return found;
}

// A literal stays as one token so `"a" | "b"` is not read as the start of a closure.
function tokenize(source) {
	const visible = scan(source);
	const tokens = [];
	let line = 1;
	for (let offset = 0; offset < source.length;) {
		const character = source[offset];
		if (visible[offset] === -1 && character !== '/' && visible[offset - 1] !== -1) tokens.push({ text: '', line, kind: 'literal' });
		if (visible[offset] === -1 || /\s/.test(character)) {
			if (character === '\n') line++;
			offset++;
			continue;
		}
		const word = /^'?[A-Za-z_]\w*/.exec(source.slice(offset, offset + 128));
		if (word && !(word[0][0] === "'" && source[offset + word[0].length] === "'")) {
			tokens.push({ text: word[0], line, kind: word[0][0] === "'" ? 'lifetime' : 'identifier' });
			offset += word[0].length;
			continue;
		}
		const pair = source.slice(offset, offset + 2);
		const text = PAIRS.has(pair) ? pair : character;
		tokens.push({ text, line, kind: 'punctuation' });
		offset += text.length;
	}
	return tokens;
}

function closingIndex(tokens, open) {
	const opening = tokens[open].text;
	let depth = 0;
	for (let index = open; index < tokens.length; index++) {
		const text = tokens[index].text;
		if (text === opening) depth++;
		else if (text === CLOSER[opening] && --depth === 0) return index;
		else if (opening === '<' && (text === '{' || text === ';')) return index;
	}
	return tokens.length;
}

// Method, type and constant names inside `impl Trait for Type` are chosen by the trait.
function implementationHeader(tokens, index, add, traitImplementations) {
	let next = index + 1;
	if (tokens[next]?.text === '<') next = genericParameters(tokens, next, add) + 1;
	while (next < tokens.length && !['{', ';', 'for'].includes(tokens[next].text)) next++;
	if (tokens[next]?.text === 'for') {
		while (next < tokens.length && tokens[next].text !== '{') next++;
		traitImplementations.push([next, closingIndex(tokens, next)]);
	}
	return next;
}

function useAliases(tokens, index, add) {
	let next = index;
	for (; next < tokens.length && tokens[next].text !== ';'; next++) {
		if (tokens[next].text === 'as' && tokens[next + 1]?.kind === 'identifier') add(next + 1);
	}
	return next;
}

function item(tokens, index, add, traitImplementations) {
	const keyword = tokens[index].text;
	if (keyword === 'const' && ['fn', 'unsafe', 'async'].includes(tokens[index + 1].text)) return;
	const name = index + 1;
	if (!traitImplementations.some(([start, end]) => name > start && name < end)) add(name);
	let next = name + 1;
	if (tokens[next]?.text === '<') next = genericParameters(tokens, next, add) + 1;
	if (keyword === 'fn' && tokens[next]?.text === '(') functionParameters(tokens, next, add);
	if (keyword === 'struct' || keyword === 'union') {
		while (next < tokens.length && !['{', ';', '('].includes(tokens[next].text)) next++;
		if (tokens[next]?.text === '{') fields(tokens, next, add);
	}
	if (keyword === 'enum') {
		while (next < tokens.length && tokens[next].text !== '{') next++;
		variants(tokens, next, add);
	}
}

function genericParameters(tokens, open, add) {
	const end = closingIndex(tokens, open);
	let depth = 0;
	let start = true;
	for (let index = open + 1; index < end; index++) {
		const token = tokens[index];
		if (['<', '(', '['].includes(token.text)) depth++;
		else if (['>', ')', ']'].includes(token.text)) depth--;
		else if (token.text === ',' && depth === 0) {
			start = true;
			continue;
		}
		if (start && depth === 0 && token.text === 'const') continue;
		if (start && depth === 0 && token.kind !== 'punctuation') add(index);
		start = false;
	}
	return end;
}

function functionParameters(tokens, open, add) {
	const end = closingIndex(tokens, open);
	let depth = 0;
	let segment = open + 1;
	for (let index = open + 1; index <= end; index++) {
		const text = tokens[index].text;
		if (OPENING.has(text)) depth++;
		else if (CLOSING.has(text) && index !== end) depth--;
		if ((text === ',' && depth === 0) || index === end) {
			const colon = topLevelColon(tokens, segment, index);
			if (colon < index) patternBindings(tokens, segment, colon, add);
			segment = index + 1;
		}
	}
}

function topLevelColon(tokens, from, to) {
	let depth = 0;
	for (let index = from; index < to; index++) {
		const text = tokens[index].text;
		if (['(', '[', '{'].includes(text)) depth++;
		else if ([')', ']', '}'].includes(text)) depth--;
		else if (text === ':' && depth === 0) return index;
	}
	return to;
}

function fields(tokens, open, add) {
	const end = closingIndex(tokens, open);
	let depth = 0;
	for (let index = open + 1; index < end; index++) {
		const token = tokens[index];
		if (OPENING.has(token.text)) depth++;
		else if (CLOSING.has(token.text)) depth--;
		else if (depth === 0 && token.kind === 'identifier' && tokens[index + 1]?.text === ':' && token.text !== 'pub') add(index);
	}
}

function variants(tokens, open, add) {
	const end = closingIndex(tokens, open);
	let depth = 0;
	let start = true;
	for (let index = open + 1; index < end; index++) {
		const token = tokens[index];
		if (token.text === '#') {
			index = closingIndex(tokens, index + 1);
			continue;
		}
		if (OPENING.has(token.text)) {
			if (token.text === '{' && depth === 0) fields(tokens, index, add);
			depth++;
		} else if (CLOSING.has(token.text)) depth--;
		else if (token.text === ',' && depth === 0) {
			start = true;
			continue;
		}
		if (start && depth === 0 && token.kind === 'identifier') add(index);
		start = false;
	}
}

function statementPattern(tokens, index, add) {
	const stops = tokens[index].text === 'let' ? ['=', ':', ';'] : ['in'];
	let end = index + 1;
	let depth = 0;
	for (; end < tokens.length && !(depth === 0 && stops.includes(tokens[end].text)); end++) {
		if (['(', '[', '{'].includes(tokens[end].text)) depth++;
		else if ([')', ']', '}'].includes(tokens[end].text)) depth--;
	}
	patternBindings(tokens, index + 1, end, add);
}

// A binding is a lower-case name that is not a path segment, a call, a macro or a field label.
function patternBindings(tokens, from, to, add) {
	for (let index = from; index < to; index++) {
		const token = tokens[index];
		if (token.kind !== 'identifier' || NOT_BINDINGS.has(token.text) || /^[A-Z]/.test(token.text)) continue;
		const next = tokens[index + 1]?.text;
		const previous = tokens[index - 1]?.text;
		if (['(', '{', '::', '!'].includes(next) || previous === '::' || previous === '.') continue;
		if (next === ':' && [',', '{'].includes(previous) && insideBraces(tokens, from, index)) continue;
		add(index);
	}
}

function insideBraces(tokens, from, at) {
	let depth = 0;
	for (let index = at - 1; index >= from; index--) {
		if (tokens[index].text === '}') depth++;
		else if (tokens[index].text === '{' && depth-- === 0) return true;
	}
	return false;
}

function endsExpression(token) {
	if (!token) return false;
	if (token.kind === 'literal' || token.kind === 'lifetime') return true;
	if (token.kind === 'identifier') return !EXPRESSION_START_KEYWORDS.has(token.text);
	return [')', ']', '}', '?'].includes(token.text) || /^\d$/.test(token.text);
}

function closureParameters(tokens, open, add) {
	let depth = 0;
	let segment = open + 1;
	let typed = false;
	for (let index = open + 1; index < tokens.length; index++) {
		const text = tokens[index].text;
		if (OPENING.has(text)) depth++;
		else if (CLOSING.has(text)) depth--;
		else if (depth === 0 && text === ':' && !typed) {
			patternBindings(tokens, segment, index, add);
			typed = true;
		} else if (depth === 0 && (text === ',' || text === '|')) {
			if (!typed) patternBindings(tokens, segment, index, add);
			if (text === '|') return index;
			segment = index + 1;
			typed = false;
		}
	}
	return tokens.length;
}

// An arm's pattern ends at `=>` or at a top-level `if` guard.
function matchArms(tokens, index, add) {
	const open = bodyOpening(tokens, index);
	const end = closingIndex(tokens, open);
	for (let arm = open + 1; arm < end;) {
		let arrow = arm;
		let guard = -1;
		let depth = 0;
		for (; arrow < end; arrow++) {
			const text = tokens[arrow].text;
			if (['(', '[', '{'].includes(text)) depth++;
			else if ([')', ']', '}'].includes(text)) depth--;
			else if (depth === 0 && text === 'if' && guard < 0) guard = arrow;
			else if (depth === 0 && text === '=>') break;
		}
		if (arrow >= end) return;
		patternBindings(tokens, arm, guard < 0 ? arrow : guard, add);
		arm = armEnd(tokens, arrow, end);
	}
}

function bodyOpening(tokens, index) {
	let depth = 0;
	for (let open = index + 1; open < tokens.length; open++) {
		const text = tokens[open].text;
		if (text === '(' || text === '[') depth++;
		else if (text === ')' || text === ']') depth--;
		else if (text === '{' && depth === 0) return open;
	}
	return tokens.length;
}

function armEnd(tokens, arrow, end) {
	const block = tokens[arrow + 1]?.text === '{';
	let depth = 0;
	for (let next = arrow + 1; next < end; next++) {
		const text = tokens[next].text;
		if (['(', '[', '{'].includes(text)) depth++;
		else if ([')', ']', '}'].includes(text)) {
			depth--;
			if (block && depth === 0 && text === '}' && tokens[next + 1]?.text !== ',') return next + 1;
		} else if (depth === 0 && text === ',') return next + 1;
	}
	return end;
}

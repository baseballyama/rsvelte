/**
 * Formatting-difference absorption for corpus comparison.
 *
 * The official compiler prints through esrap, which re-derives blank lines
 * from its own layout rules; rsvelte preserves source blank lines and does
 * NOT re-create esrap's margins (doing so would require re-parsing every
 * compile output — an unacceptable cost for a compiler targeting 100x
 * performance). Blank lines are pure formatting, so they are normalized
 * away here, in the comparison layer, alongside oxfmt.
 *
 * Blank lines inside template literals and block comments are real content
 * and are preserved: a single-pass scanner tracks string / template (with
 * ${} nesting) / comment state, and only lines whose newline is outside
 * any multi-line token are eligible for removal.
 */
export function stripBlankLines(src) {
	const keep = new Set(); // offsets of newlines inside template literals / block comments
	let i = 0;
	const n = src.length;
	let state = 'code'; // code | line-comment | block-comment | squote | dquote | template
	const templateDepth = []; // ${} brace nesting per template level
	while (i < n) {
		const c = src[i];
		const c2 = src[i + 1];
		switch (state) {
			case 'code':
				if (c === '/' && c2 === '/') (state = 'line-comment'), i++;
				else if (c === '/' && c2 === '*') (state = 'block-comment'), i++;
				else if (c === "'") state = 'squote';
				else if (c === '"') state = 'dquote';
				else if (c === '`') (state = 'template'), templateDepth.push(0);
				else if (c === '}' && templateDepth.length && templateDepth[templateDepth.length - 1] === 0) {
					state = 'template';
				} else if (c === '{' && templateDepth.length) {
					templateDepth[templateDepth.length - 1]++;
				} else if (c === '}' && templateDepth.length) {
					templateDepth[templateDepth.length - 1]--;
				}
				break;
			case 'line-comment':
				if (c === '\n') state = 'code';
				break;
			case 'block-comment':
				if (c === '\n') keep.add(i);
				else if (c === '*' && c2 === '/') (state = 'code'), i++;
				break;
			case 'squote':
				if (c === '\\') i++;
				else if (c === "'" || c === '\n') state = 'code';
				break;
			case 'dquote':
				if (c === '\\') i++;
				else if (c === '"' || c === '\n') state = 'code';
				break;
			case 'template':
				if (c === '\\') i++;
				else if (c === '\n') keep.add(i);
				else if (c === '`') (state = 'code'), templateDepth.pop();
				else if (c === '$' && c2 === '{') (state = 'code'), i++;
				break;
		}
		i++;
	}
	const out = [];
	let lineStart = 0;
	for (let j = 0; j <= n; j++) {
		if (j === n || src[j] === '\n') {
			const line = src.slice(lineStart, j);
			if (line.trim() !== '' || keep.has(j)) out.push(line);
			lineStart = j + 1;
		}
	}
	return out.join('\n');
}

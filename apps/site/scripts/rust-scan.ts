// Finds the brace depth of each byte of Rust source, so a brace inside a literal or a comment
// never changes the structure the code-name guard reads.

/** Per byte: brace depth before that byte, or -1 inside a comment or literal. */
export function scan(source: string): Int32Array {
	const depth = new Int32Array(source.length + 1);
	let d = 0;
	let i = 0;
	const opaque = (from: number, to: number) => depth.fill(-1, from, to);
	while (i < source.length) {
		const c = source[i];
		const next = source[i + 1];
		if (c === '/' && next === '/') {
			const end = source.indexOf('\n', i);
			const stop = end === -1 ? source.length : end;
			opaque(i, stop);
			i = stop;
			continue;
		}
		if (c === '/' && next === '*') {
			let level = 1;
			let j = i + 2;
			while (j < source.length && level > 0) {
				if (source[j] === '/' && source[j + 1] === '*') {
					level++;
					j += 2;
				} else if (source[j] === '*' && source[j + 1] === '/') {
					level--;
					j += 2;
				} else j++;
			}
			opaque(i, j);
			i = j;
			continue;
		}
		const raw = /^b?r(#*)"/.exec(source.slice(i, i + 12));
		if (raw && (i === 0 || !/[\w]/.test(source[i - 1]))) {
			const close = '"' + raw[1];
			const end = source.indexOf(close, i + raw[0].length);
			if (end === -1) throw new Error(`unterminated raw string at ${i}`);
			opaque(i, end + close.length);
			i = end + close.length;
			continue;
		}
		if (c === '"' || (c === 'b' && next === '"' && !/[\w]/.test(source[i - 1] ?? ''))) {
			let j = c === 'b' ? i + 2 : i + 1;
			while (j < source.length && source[j] !== '"') j += source[j] === '\\' ? 2 : 1;
			opaque(i, j + 1);
			i = j + 1;
			continue;
		}
		if (c === "'") {
			// A char literal is 'x' or '\…'; otherwise this is a lifetime or a label.
			const esc = next === '\\';
			const close = esc ? source.indexOf("'", i + 3) : source[i + 2] === "'" ? i + 2 : -1;
			const astral =
				!esc && source.codePointAt(i + 1)! > 0xffff && source[i + 3] === "'" ? i + 3 : -1;
			const end = close !== -1 ? close : astral;
			if (end !== -1 && end - i <= 12) {
				opaque(i, end + 1);
				i = end + 1;
				continue;
			}
		}
		depth[i] = d;
		if (c === '{') d++;
		else if (c === '}') {
			d--;
			depth[i] = d;
		}
		i++;
	}
	depth[source.length] = d;
	if (d !== 0) throw new Error(`unbalanced braces (depth ${d} at end of file)`);
	return depth;
}

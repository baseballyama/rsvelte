import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let value = '1';

	function onkeydown(e) {
		let _v = parseFloat(value);

		if (e.key === 'ArrowUp') _v += 1; else if (e.key === 'ArrowDown') _v -= 1;

		value = _v.toString();
	}

	$$renderer.push(`<label><input${$.attr('value', value)}/> arrow up/down</label> <p>value = ${$.escape(value)}</p>`);
}
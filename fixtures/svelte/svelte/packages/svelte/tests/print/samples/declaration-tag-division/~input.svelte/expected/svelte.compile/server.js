import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let visible = true;
	let total = 10;
	let width = 16;
	let height = 9;
	let divisor = 2;
	let options = {};

	if (visible) {
		$$renderer.push('<!--[0-->');

		const half = total / 2;
		let derived = $.derived(() => total / 4);
		const member = width / height;
		const call = Math.max(total, 1) / 2;
		const string_then_division = 'ab' / divisor;
		const typed = total / 2;
		const { fallback = total / 2 } = options;
		const regex = /[}]/;

		$$renderer.push(`<p>5 2.5 1.7777777777777777 5 NaN 5 ${$.escape(fallback)} /[}]/</p>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}
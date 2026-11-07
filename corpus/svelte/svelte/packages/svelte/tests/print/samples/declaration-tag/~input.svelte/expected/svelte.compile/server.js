import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	if (visible) {
		$$renderer.push('<!--[0-->');

		let count = 1;
		const doubled = count * 2;
		const label = 'count';
		const format = (value) => `${label}: ${value}`;

		$$renderer.push(`<p>${$.escape(format(doubled))}</p>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}
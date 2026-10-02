import * as $ from 'svelte/internal/server';

export default function Svelte_ignore_code_action_ts($$renderer) {
	const a = { b: true };

	$$renderer.push(`<img/> `);

	if (true) {
		$$renderer.push(`<!--[0--><a></a> <a href="">about</a>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}
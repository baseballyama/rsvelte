import * as $ from 'svelte/internal/server';

export default function _5_input($$renderer) {
	let error = null;
	let reset = () => {};

	function onerror(e, r) {
		error = e;
		reset = r;
	}

	$$renderer.push(`<!--[-->`);

	{
		FlakyComponent($$renderer, {});
	}

	$$renderer.push(`<!--]-->`);
	$$renderer.push(` `);

	if (error) {
		$$renderer.push(`<!--[0--><button>oops! try again</button>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}
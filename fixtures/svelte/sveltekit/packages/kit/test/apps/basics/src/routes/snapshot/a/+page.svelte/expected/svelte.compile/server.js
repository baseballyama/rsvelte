import * as $ from 'svelte/internal/server';

export default function _page($$renderer, $$props) {
	let message = '';

	/** @type {import('./$types').Snapshot<string>} */
	const snapshot = {
		capture: () => message,
		restore: (snapshot) => message = snapshot
	};

	$$renderer.push(`<input${$.attr('value', message)}/>`);
	$.bind_props($$props, { snapshot });
}
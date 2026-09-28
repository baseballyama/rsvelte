import * as $ from 'svelte/internal/server';

export default function Container($$renderer, $$props) {
	/** @type {{ children: import('svelte').Snippet }} */
	let { children } = $$props;

	let visible = false;

	$$renderer.push(`<button>toggle</button> `);

	if (visible) {
		$$renderer.push('<!--[0-->');
		children($$renderer);
		$$renderer.push(`<!---->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}
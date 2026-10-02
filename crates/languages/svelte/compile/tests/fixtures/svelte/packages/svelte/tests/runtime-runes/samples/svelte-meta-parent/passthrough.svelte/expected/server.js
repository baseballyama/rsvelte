import * as $ from 'svelte/internal/server';

export default function Passthrough($$renderer, $$props) {
	let { children, named } = $$props;

	children?.($$renderer);
	$$renderer.push(`<!----> `);

	if (true) {
		$$renderer.push('<!--[0-->');
		named?.($$renderer);
		$$renderer.push(`<!---->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}
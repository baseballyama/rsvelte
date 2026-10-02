import * as $ from 'svelte/internal/server';

export default function SetUTCFullYear03_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const variable = new Date(8.64e15);

		variable.setUTCFullYear(1968, 10, 3);
		$$renderer.push(`<!---->${$.escape(variable)}`);
	});
}
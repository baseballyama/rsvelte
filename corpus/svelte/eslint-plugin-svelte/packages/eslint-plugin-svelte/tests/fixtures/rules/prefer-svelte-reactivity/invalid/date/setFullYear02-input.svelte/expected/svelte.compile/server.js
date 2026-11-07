import * as $ from 'svelte/internal/server';

export default function SetFullYear02_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const variable = new Date(8.64e15);

		variable.setFullYear(1968, 10);
		$$renderer.push(`<!---->${$.escape(variable)}`);
	});
}
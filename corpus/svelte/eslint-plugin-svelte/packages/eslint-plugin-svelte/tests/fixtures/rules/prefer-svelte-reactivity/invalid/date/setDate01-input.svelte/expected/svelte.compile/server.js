import * as $ from 'svelte/internal/server';

export default function SetDate01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const variable = new Date(8.64e15);

		variable.setDate(24);
		$$renderer.push(`<!---->${$.escape(variable)}`);
	});
}
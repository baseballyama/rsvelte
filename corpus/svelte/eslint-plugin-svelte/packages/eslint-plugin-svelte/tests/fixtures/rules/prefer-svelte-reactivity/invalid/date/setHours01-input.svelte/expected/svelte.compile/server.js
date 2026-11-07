import * as $ from 'svelte/internal/server';

export default function SetHours01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const variable = new Date(8.64e15);

		variable.setHours(23);
		$$renderer.push(`<!---->${$.escape(variable)}`);
	});
}
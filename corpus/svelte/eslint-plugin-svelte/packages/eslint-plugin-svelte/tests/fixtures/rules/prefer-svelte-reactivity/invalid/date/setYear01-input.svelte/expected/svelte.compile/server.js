import * as $ from 'svelte/internal/server';

export default function SetYear01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const variable = new Date(8.64e15);

		variable.setYear(1968);
		$$renderer.push(`<!---->${$.escape(variable)}`);
	});
}
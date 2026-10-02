import * as $ from 'svelte/internal/server';

export default function SetMilliseconds01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const variable = new Date(8.64e15);

		variable.setMilliseconds(999);
		$$renderer.push(`<!---->${$.escape(variable)}`);
	});
}
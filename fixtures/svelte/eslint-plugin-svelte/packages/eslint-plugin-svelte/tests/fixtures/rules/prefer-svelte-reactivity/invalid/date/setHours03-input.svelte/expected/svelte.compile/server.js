import * as $ from 'svelte/internal/server';

export default function SetHours03_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const variable = new Date(8.64e15);

		variable.setHours(23, 59, 59);
		$$renderer.push(`<!---->${$.escape(variable)}`);
	});
}
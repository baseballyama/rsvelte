import * as $ from 'svelte/internal/server';

export default function SetMonth02_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const variable = new Date(8.64e15);

		variable.setMonth(11, 23);
		$$renderer.push(`<!---->${$.escape(variable)}`);
	});
}
import * as $ from 'svelte/internal/server';

export default function SetUTCMonth02_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const variable = new Date(8.64e15);

		variable.setUTCMonth(10, 3);
		$$renderer.push(`<!---->${$.escape(variable)}`);
	});
}
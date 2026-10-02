import * as $ from 'svelte/internal/server';

export default function SetUTCHours02_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const variable = new Date(8.64e15);

		variable.setUTCHours(23, 59);
		$$renderer.push(`<!---->${$.escape(variable)}`);
	});
}
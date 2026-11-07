import * as $ from 'svelte/internal/server';

export default function SetUTCMinutes02_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const variable = new Date(8.64e15);

		variable.setUTCMinutes(59, 59);
		$$renderer.push(`<!---->${$.escape(variable)}`);
	});
}
import * as $ from 'svelte/internal/server';

export default function SetUTCMinutes03_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const variable = new Date(8.64e15);

		variable.setUTCMinutes(59, 59, 999);
		$$renderer.push(`<!---->${$.escape(variable)}`);
	});
}
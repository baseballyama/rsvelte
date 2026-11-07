import * as $ from 'svelte/internal/server';

export default function SetUTCSeconds01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const variable = new Date(8.64e15);

		variable.setUTCSeconds(59);
		$$renderer.push(`<!---->${$.escape(variable)}`);
	});
}
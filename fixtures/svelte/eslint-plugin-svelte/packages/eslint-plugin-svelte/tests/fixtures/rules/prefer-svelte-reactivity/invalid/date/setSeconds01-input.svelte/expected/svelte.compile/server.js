import * as $ from 'svelte/internal/server';

export default function SetSeconds01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const variable = new Date(8.64e15);

		variable.setSeconds(59);
		$$renderer.push(`<!---->${$.escape(variable)}`);
	});
}
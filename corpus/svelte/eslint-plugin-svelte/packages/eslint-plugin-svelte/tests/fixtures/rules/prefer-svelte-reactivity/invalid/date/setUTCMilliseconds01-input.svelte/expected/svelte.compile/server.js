import * as $ from 'svelte/internal/server';

export default function SetUTCMilliseconds01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const variable = new Date(8.64e15);

		variable.setUTCMilliseconds(420);
		$$renderer.push(`<!---->${$.escape(variable)}`);
	});
}
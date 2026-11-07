import * as $ from 'svelte/internal/server';

export default function SetTime01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const variable = new Date(8.64e15);

		variable.setTime(123456);
		$$renderer.push(`<!---->${$.escape(variable)}`);
	});
}
import * as $ from 'svelte/internal/server';

export default function Password01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const variable = new URL("https://svelte.dev/");

		variable.password = "passwd";
		$$renderer.push(`<!---->${$.escape(variable)}`);
	});
}
import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function template() {}

		$$renderer.push(`<!---->${$.escape(template())}`);
	});
}
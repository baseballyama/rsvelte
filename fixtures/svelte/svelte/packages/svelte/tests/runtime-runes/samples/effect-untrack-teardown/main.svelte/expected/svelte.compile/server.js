import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let prop = void 0;
		let key = {};

		function action() {
			prop = {};
		}

		$$renderer.push(`<!---->`);

		{
			$$renderer.push(`<div>test</div>`);
		}

		$$renderer.push(`<!---->`);
	});
}
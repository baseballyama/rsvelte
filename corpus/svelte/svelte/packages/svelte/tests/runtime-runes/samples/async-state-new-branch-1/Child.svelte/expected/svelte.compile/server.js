import * as $ from 'svelte/internal/server';

export default function Child($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { x } = $$props;

		console.log(x);
		$$renderer.push(`<!---->${$.escape(x)}`);
	});
}
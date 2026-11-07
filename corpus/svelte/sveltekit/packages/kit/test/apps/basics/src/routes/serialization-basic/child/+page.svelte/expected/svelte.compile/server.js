import * as $ from 'svelte/internal/server';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;

		$$renderer.push(`<h1>${$.escape(data.foo.bar())}</h1>`);
	});
}
import * as $ from 'svelte/internal/server';
import { link } from 'svelte-spa-router';

export default function Catalog($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Import the link action
		let { params } = $$props;

		let id = $.derived(() => params && parseInt(params.id, 10));

		$$renderer.push(`<h1 id="catalog">Item ${$.escape(id())}</h1> <a id="previous" href="">Previous</a> <a id="next" href="">Next</a>`);
	});
}
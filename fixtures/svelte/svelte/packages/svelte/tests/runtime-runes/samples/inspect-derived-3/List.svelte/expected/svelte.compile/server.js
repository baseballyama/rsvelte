import * as $ from 'svelte/internal/server';
import { setContext } from 'svelte';

export default function List($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, selectedValue } = $$props;
		let listContext = { selectedValue };

		setContext('list', listContext);
		$$renderer.push(`<div class="list">`);
		children($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}
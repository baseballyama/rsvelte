import * as $ from 'svelte/internal/server';
import { useOptions } from '../options.svelte.js';
import { slide } from '../transition/index.js';

export default function Entry($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { i = 0, children } = $$props;
		const options = useOptions();

		$$renderer.push(`<div role="listitem" class="entry"${$.attr_style(`--i: ${$.stringify(i)}`)}>`);
		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}
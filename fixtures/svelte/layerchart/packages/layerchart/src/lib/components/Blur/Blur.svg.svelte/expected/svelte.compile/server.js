import * as $ from 'svelte/internal/server';
import { createId } from '$lib/utils/createId.js';

export default function Blur_svg($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);
		let { id = createId('blur-', uid), stdDeviation = 5, children } = $$props;

		$$renderer.push(`<defs><filter${$.attr('id', id)} class="lc-blur-filter"><feGaussianBlur in="SourceGraphic"${$.attr('stdDeviation', stdDeviation)}></feGaussianBlur></filter></defs>`);

		if (children) {
			$$renderer.push(`<!--[0--><g${$.attr('filter', `url(#${$.stringify(id)})`)} class="lc-blur-g">`);
			children($$renderer);
			$$renderer.push(`<!----></g>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}
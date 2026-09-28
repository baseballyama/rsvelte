import * as $ from 'svelte/internal/server';
import { MathUtils } from 'three';

export default function FadeOut($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { progress, from = 0, to = 1, children } = $$props;
		let p = $.derived(() => MathUtils.clamp(MathUtils.mapLinear(progress, from, to, 1, 0), 0, 1));

		$$renderer.push(`<div${$.attr_style(`opacity: ${$.stringify(p())};`)}>`);

		if (p() > 0) {
			$$renderer.push('<!--[0-->');
			children?.($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}
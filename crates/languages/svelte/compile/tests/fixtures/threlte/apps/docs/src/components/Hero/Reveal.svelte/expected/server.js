import * as $ from 'svelte/internal/server';
import { MathUtils } from 'three';

export default function Reveal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { progress, from = 0, to = 1, children } = $$props;
		let p = $.derived(() => MathUtils.clamp(MathUtils.mapLinear(progress, from, to, 0, 1), 0, 1));

		$$renderer.push(`<div class="reveal svelte-mjyag7"${$.attr_style(`--progress: ${$.stringify(p())};`)}>`);
		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}
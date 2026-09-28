import * as $ from 'svelte/internal/server';

export default function Svg($$renderer, $$props) {
	$$renderer.push(`<svg><!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--></svg>`);
}
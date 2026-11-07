import * as $ from 'svelte/internal/server';

export default function Tiles($$renderer, $$props) {
	$$renderer.push(`<ul class="grid-box common-section" style="--grid-item-size:25rem;" data-private=""><!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--></ul>`);
}
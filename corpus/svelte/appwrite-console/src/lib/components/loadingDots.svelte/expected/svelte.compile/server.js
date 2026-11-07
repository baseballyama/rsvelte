import * as $ from 'svelte/internal/server';

export default function LoadingDots($$renderer, $$props) {
	let className = '';

	$$renderer.push(`<div${$.attr_class(`loading-dots ${$.stringify(className)}`, 'svelte-13j78r0')}><div class="dot svelte-13j78r0"></div> <div class="dot svelte-13j78r0"></div> <div class="dot svelte-13j78r0"></div></div>`);
	$.bind_props($$props, { class: className });
}
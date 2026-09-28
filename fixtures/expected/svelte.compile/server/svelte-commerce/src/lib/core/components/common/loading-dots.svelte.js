import * as $ from 'svelte/internal/server';

export default function Loading_dots($$renderer) {
	const visible = true;

	$$renderer.push(`<span${$.attr_class('loading-dots svelte-1i86j2l', void 0, { 'visible': visible })}><span class="dot svelte-1i86j2l"></span> <span class="dot svelte-1i86j2l"></span> <span class="dot svelte-1i86j2l"></span></span>`);
}
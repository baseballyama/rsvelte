import * as $ from 'svelte/internal/server';
import '../app.css';

export default function _layout($$renderer, $$props) {
	$$renderer.push(`<main class="svelte-13uav2n"><!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--></main>`);
}
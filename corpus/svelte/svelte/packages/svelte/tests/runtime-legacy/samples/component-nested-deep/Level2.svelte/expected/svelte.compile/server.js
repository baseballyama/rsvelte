import * as $ from 'svelte/internal/server';
import Level3 from './Level3.svelte';

export default function Level2($$renderer, $$props) {
	$$renderer.push(`<span>level 2</span> <!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]-->`);
}
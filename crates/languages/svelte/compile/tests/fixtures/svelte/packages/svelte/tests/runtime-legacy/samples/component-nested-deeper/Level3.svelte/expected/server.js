import * as $ from 'svelte/internal/server';

export default function Level3($$renderer, $$props) {
	$$renderer.push(`<div class="level3"><h4>level 3</h4> <!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--></div>`);
}
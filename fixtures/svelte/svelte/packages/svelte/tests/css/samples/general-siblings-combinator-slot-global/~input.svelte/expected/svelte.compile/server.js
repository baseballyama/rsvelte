import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	$$renderer.push(`<div><p class="before svelte-1wmc2u9">before</p> <!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--> <p class="foo svelte-1wmc2u9"><span class="svelte-1wmc2u9">foo</span></p> <p class="bar svelte-1wmc2u9">bar</p></div>`);
}
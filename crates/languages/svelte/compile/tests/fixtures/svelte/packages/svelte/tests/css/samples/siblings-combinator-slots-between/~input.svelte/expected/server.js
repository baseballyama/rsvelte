import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	$$renderer.push(`<h1 class="svelte-l7si0u">test</h1> <!--[-->`);
	$.slot($$renderer, $$props, 'a', {}, null);
	$$renderer.push(`<!--]--> <!--[-->`);
	$.slot($$renderer, $$props, 'b', {}, null);
	$$renderer.push(`<!--]--> <!--[-->`);
	$.slot($$renderer, $$props, 'c', {}, null);
	$$renderer.push(`<!--]--> <span class="svelte-l7si0u">Hello</span>`);
}
import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	$$renderer.push(`<h1 class="svelte-11ai20p">test</h1> <!--[-->`);

	$.slot($$renderer, $$props, 'default', {}, () => {
		$$renderer.push(`<span class="svelte-11ai20p">Hello</span>`);
	});

	$$renderer.push(`<!--]-->`);
}
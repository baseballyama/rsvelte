import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	$$renderer.push(`<h1 class="svelte-13rp9nx">test</h1> <!--[-->`);

	$.slot($$renderer, $$props, 'default', {}, () => {
		$$renderer.push(`<span class="svelte-13rp9nx">Hello</span>`);
	});

	$$renderer.push(`<!--]-->`);
}
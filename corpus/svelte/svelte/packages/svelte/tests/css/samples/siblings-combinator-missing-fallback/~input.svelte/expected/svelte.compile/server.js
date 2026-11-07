import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	$$renderer.push(`<x class="svelte-w5lgmd"></x> <!--[-->`);

	$.slot($$renderer, $$props, 'default', {}, () => {
		$$renderer.push(`<y>fallback content</y>`);
	});

	$$renderer.push(`<!--]--> <z class="svelte-w5lgmd">this should be green if the slot fallback is not rendered</z>`);
}
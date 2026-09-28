import * as $ from 'svelte/internal/server';

export default function Nested($$renderer, $$props) {
	$$renderer.push(`<div><!--[-->`);

	$.slot($$renderer, $$props, 'default', {}, () => {
		$$renderer.push(`<p class="default">default fallback content</p>`);
	});

	$$renderer.push(`<!--]--> <!--[-->`);

	$.slot($$renderer, $$props, 'bar', {}, () => {
		$$renderer.push(`bar fallback`);
	});

	$$renderer.push(`<!--]--></div>`);
}
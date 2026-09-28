import * as $ from 'svelte/internal/server';

export default function Nested($$renderer, $$props) {
	$$renderer.push(`<div><!--[-->`);

	$.slot($$renderer, $$props, 'default', {}, () => {
		$$renderer.push(`<p class="default">default fallback content</p>`);
	});

	$$renderer.push(`<!--]--> <!--[-->`);

	$.slot($$renderer, $$props, 'bar', {}, () => {
		$$renderer.push(`<p class="default">bar fallback content</p>`);
	});

	$$renderer.push(`<!--]--> <!--[-->`);

	$.slot($$renderer, $$props, 'foo', {}, () => {
		$$renderer.push(`<p class="default">foo fallback content</p>`);
	});

	$$renderer.push(`<!--]--></div>`);
}
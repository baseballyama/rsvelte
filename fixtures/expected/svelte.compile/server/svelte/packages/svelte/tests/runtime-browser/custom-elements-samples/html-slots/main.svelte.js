import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.push(`<div><!--[-->`);

	$.slot($$renderer, $$props, 'default', {}, () => {
		$$renderer.push(`<p>default fallback content</p>`);
	});

	$$renderer.push(`<!--]--> <!--[-->`);

	$.slot($$renderer, $$props, 'foo', {}, () => {
		$$renderer.push(`<p>foo fallback content</p>`);
	});

	$$renderer.push(`<!--]--></div>`);
}
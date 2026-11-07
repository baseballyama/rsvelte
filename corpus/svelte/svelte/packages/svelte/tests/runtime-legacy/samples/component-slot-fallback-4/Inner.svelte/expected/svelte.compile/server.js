import * as $ from 'svelte/internal/server';

export default function Inner($$renderer, $$props) {
	$$renderer.push(`<!--[-->`);
	$.slot($$renderer, $$props, 'a', {}, () => {});
	$$renderer.push(`<!--]--> <!--[-->`);
	$.slot($$renderer, $$props, 'b', {}, () => {});
	$$renderer.push(`<!--]--> <!--[-->`);

	$.slot($$renderer, $$props, 'c', {}, () => {
		$$renderer.push(`foobar`);
	});

	$$renderer.push(`<!--]-->`);
}
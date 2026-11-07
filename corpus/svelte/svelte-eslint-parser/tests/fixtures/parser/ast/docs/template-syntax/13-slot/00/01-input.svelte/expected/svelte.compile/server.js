import * as $ from 'svelte/internal/server';

export default function _1_input($$renderer, $$props) {
	$$renderer.push(`<!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, () => {});
	$$renderer.push(`<!--]--> <!--[-->`);
	$.slot($$renderer, $$props, 'x', {}, () => {});
	$$renderer.push(`<!--]--> <!--[-->`);
	$.slot($$renderer, $$props, 'default', { prop: value }, null);
	$$renderer.push(`<!--]-->`);
}
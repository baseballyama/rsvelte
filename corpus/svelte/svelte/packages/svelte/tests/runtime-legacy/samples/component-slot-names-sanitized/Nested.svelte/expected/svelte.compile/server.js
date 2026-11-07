import * as $ from 'svelte/internal/server';

export default function Nested($$renderer, $$props) {
	$$renderer.push(`<div><!--[-->`);
	$.slot($$renderer, $$props, 'header1', {}, null);
	$$renderer.push(`<!--]--> <!--[-->`);
	$.slot($$renderer, $$props, '-header2_', {}, null);
	$$renderer.push(`<!--]--> <!--[-->`);
	$.slot($$renderer, $$props, '3header', {}, null);
	$$renderer.push(`<!--]--> <!--[-->`);
	$.slot($$renderer, $$props, '_header4', {}, null);
	$$renderer.push(`<!--]--> <!--[-->`);
	$.slot($$renderer, $$props, 'header-5', {}, null);
	$$renderer.push(`<!--]--> <!--[-->`);
	$.slot($$renderer, $$props, 'header&5', {}, null);
	$$renderer.push(`<!--]--></div>`);
}
import * as $ from 'svelte/internal/server';

export default function Multi_report01_output($$renderer, $$props) {
	const x = 'x';
	const SLOT_NAME = x;

	$$renderer.push(`<!--[-->`);
	$.slot($$renderer, $$props, 'x', {}, null);
	$$renderer.push(`<!--]--> <!--[-->`);
	$.slot($$renderer, $$props, 'x', {}, null);
	$$renderer.push(`<!--]--> <!--[-->`);
	$.slot($$renderer, $$props, 'x', {}, null);
	$$renderer.push(`<!--]-->`);
}
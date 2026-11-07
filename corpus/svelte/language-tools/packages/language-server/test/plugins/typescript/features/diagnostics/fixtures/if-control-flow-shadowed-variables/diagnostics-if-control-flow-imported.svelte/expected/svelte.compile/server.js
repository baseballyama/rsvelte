import * as $ from 'svelte/internal/server';

export default function Diagnostics_if_control_flow_imported($$renderer, $$props) {
	const foo = '';

	$$renderer.push(`<!--[-->`);
	$.slot($$renderer, $$props, 'default', { foo, b: foo }, null);
	$$renderer.push(`<!--]-->`);
}
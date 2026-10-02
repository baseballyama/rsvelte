import * as $ from 'svelte/internal/server';

export default function Var_slot01_output($$renderer, $$props) {
	const SLOT_NAME = 'name';

	$$renderer.push(`<!--[-->`);
	$.slot($$renderer, $$props, 'name', {}, null);
	$$renderer.push(`<!--]-->`);
	$.bind_props($$props, { SLOT_NAME });
}
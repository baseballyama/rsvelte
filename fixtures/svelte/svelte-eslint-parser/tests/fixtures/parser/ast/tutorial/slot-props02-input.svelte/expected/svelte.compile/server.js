import * as $ from 'svelte/internal/server';

export default function Slot_props02_input($$renderer, $$props) {
	let hovering;

	function enter() {
		hovering = true;
	}

	function leave() {
		hovering = false;
	}

	$$renderer.push(`<div><!--[-->`);
	$.slot($$renderer, $$props, 'default', { hovering }, null);
	$$renderer.push(`<!--]--></div>`);
}
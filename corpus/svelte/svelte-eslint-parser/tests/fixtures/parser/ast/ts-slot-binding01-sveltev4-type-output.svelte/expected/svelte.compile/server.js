import * as $ from 'svelte/internal/server';
import Component from "./ts-slot-binding01-sveltev4-input-child.svelte";

export default function Ts_slot_binding01_sveltev4_type_output($$renderer) {
	Component($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div>${$.escape(bar.prop)}</div>`);
		},
		$$slots: { default: true }
	});
}
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from "./ts-slot-binding01-input-child.svelte";

var root = $.from_html(`<div> </div>`);

export default function Ts_slot_binding01_type_output($$anchor) {
	// Component: __sveltets_2_IsomorphicComponent<any, { [evt: string]: CustomEvent<any>; }, { default: { foo: { prop: boolean; }; }; }, Record<string, any>, string>
	Component($$anchor, {
		children: ($$anchor, $$slotProps) => {
			const bar = $.derived(() => $$slotProps.foo);
			var div = root();
			var text = $.only_child(div, true);

			$.template_effect(() => $.set_text(text, $.get(bar).prop));
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}
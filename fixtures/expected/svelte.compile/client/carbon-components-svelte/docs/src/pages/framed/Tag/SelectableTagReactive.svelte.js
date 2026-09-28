import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SelectableTag } from "carbon-components-svelte";

export default function SelectableTagReactive($$anchor, $$props) {
	let selected = false;

	SelectableTag($$anchor, {
		get selected() {
			return selected;
		},

		set selected($$value) {
			selected = $$value;
		},

		$$events: {
			change: function ($$arg) {
				$.bubble_event.call(this, $$props, $$arg);
			}
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text();

			$.template_effect(() => $.set_text(text, selected ? "Selected" : "Unselected"));
			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}
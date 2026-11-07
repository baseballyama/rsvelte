import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SelectableTag } from "carbon-components-svelte";
import IbmCloud from "carbon-icons-svelte/lib/IbmCloud.svelte";

export default function SelectableTagIconReactive($$anchor, $$props) {
	let selected = true;

	SelectableTag($$anchor, {
		get icon() {
			return IbmCloud;
		},

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

			var text = $.text('IBM Cloud');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}
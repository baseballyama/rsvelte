import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Kbd from "$lib/registry/ui/kbd/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<samp>File</samp>`);

export default function Kbd_with_samp($$anchor) {
	Example($$anchor, {
		title: 'With samp',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Kbd.Root, ($$anchor, Kbd_Root) => {
				Kbd_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var samp = root();

						$.append($$anchor, samp);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}
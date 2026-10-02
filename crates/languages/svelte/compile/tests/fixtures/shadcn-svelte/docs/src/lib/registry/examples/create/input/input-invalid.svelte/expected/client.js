import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Input from "$lib/registry/ui/input/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Input_invalid($$anchor) {
	Example($$anchor, {
		title: 'Invalid',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Input.Root, ($$anchor, Input_Root) => {
				Input_Root($$anchor, { type: 'text', placeholder: 'Error', 'aria-invalid': 'true' });
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}
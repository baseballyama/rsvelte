import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Label, Checkbox } from "flowbite-svelte";

var root = $.from_html(`<!> Your Label`, 1);

export default function Default($$anchor) {
	Label($$anchor, {
		color: 'red',
		class: 'mt-4 flex items-center font-bold italic',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Checkbox(node, { classes: { div: "me-2" } });
			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}
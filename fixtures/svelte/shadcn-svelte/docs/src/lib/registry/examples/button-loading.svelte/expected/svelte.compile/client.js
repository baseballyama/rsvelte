import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "$lib/registry/ui/button/index.js";
import { Spinner } from "$lib/registry/ui/spinner/index.js";

var root = $.from_html(`<!> Submit`, 1);

export default function Button_loading($$anchor) {
	Button($$anchor, {
		size: 'sm',
		variant: 'outline',
		disabled: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Spinner(node, {});
			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}
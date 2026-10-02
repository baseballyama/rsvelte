import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ArrowUpDownIcon from "@lucide/svelte/icons/arrow-up-down";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`Email <!>`, 1);

export default function Payments_email_header($$anchor, $$props) {
	$.push($$props, true);

	Button($$anchor, {
		variant: 'ghost',
		onclick: () => $$props.column.toggleSorting($$props.column.getIsSorted() === "asc"),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root();
			var node = $.sibling($.first_child(fragment_1));

			ArrowUpDownIcon(node, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}
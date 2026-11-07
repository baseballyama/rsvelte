import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ArrowUpDownIcon from "@lucide/svelte/icons/arrow-up-down";
import { Button } from "$lib/registry/ui/button/index.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'variant']);
var root = $.from_html(`Email <!>`, 1);

export default function Data_table_email_button($$anchor, $$props) {
	let variant = $.prop($$props, 'variant', 3, "ghost"),
		restProps = $.rest_props($$props, rest_excludes);

	Button($$anchor, $.spread_props(
		{
			get variant() {
				return variant();
			}
		},
		() => restProps,
		{
			children: ($$anchor, $$slotProps) => {
				$.next();

				var fragment_1 = root();
				var node = $.sibling($.first_child(fragment_1));

				ArrowUpDownIcon(node, { class: 'ms-2 size-4' });
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}
	));
}
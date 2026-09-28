import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'open', 'submenu']);

export default function Picker($$anchor, $$props) {
	$.push($$props, true);

	let open = $.prop($$props, 'open', 15, false),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => DropdownMenuPrimitive.Sub, ($$anchor, DropdownMenuPrimitive_Sub) => {
				DropdownMenuPrimitive_Sub($$anchor, $.spread_props(() => restProps, {
					get open() {
						return open();
					},

					set open($$value) {
						open($$value);
					}
				}));
			});

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_2 = $.first_child(fragment_2);

			$.component(node_2, () => DropdownMenuPrimitive.Root, ($$anchor, DropdownMenuPrimitive_Root) => {
				DropdownMenuPrimitive_Root($$anchor, $.spread_props(() => restProps, {
					get open() {
						return open();
					},

					set open($$value) {
						open($$value);
					}
				}));
			});

			$.append($$anchor, fragment_2);
		};

		$.if(node, ($$render) => {
			if ($$props.submenu) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}
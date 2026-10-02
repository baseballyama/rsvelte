import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Popper from "$lib/utils/Popper.svelte";
import DropdownGroup from "./DropdownGroup.svelte";
import { getTheme } from "$lib/theme/themeUtils";
import clsx from "clsx";
import { setDropdownContext } from "$lib/context";
import { dropdown } from "./theme";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'simple',
	'placement',
	'offset',
	'class',
	'activeUrl',
	'isOpen',
	'onclose'
]);

export default function Dropdown($$anchor, $$props) {
	$.push($$props, true);

	let simple = $.prop($$props, 'simple', 3, false),
		placement = $.prop($$props, 'placement', 3, "bottom"),
		offset = $.prop($$props, 'offset', 3, 2),
		activeUrl = $.prop($$props, 'activeUrl', 3, ""),
		isOpen = $.prop($$props, 'isOpen', 15, false),
		restProps = $.rest_props($$props, rest_excludes);

	const theme = $.derived(() => getTheme("dropdown"));
	const base = $.derived(() => dropdown({ class: clsx($.get(theme), $$props.class) }));

	// Create reactive context using getter
	const context = {
		get activeUrl() {
			return activeUrl() ?? "";
		}
	};

	setDropdownContext(context);

	Popper($$anchor, $.spread_props(() => restProps, {
		get placement() {
			return placement();
		},

		get offset() {
			return offset();
		},

		get class() {
			return $.get(base);
		},

		get isOpen() {
			return isOpen();
		},

		set isOpen($$value) {
			isOpen($$value);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					DropdownGroup($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_1 = $.first_child(fragment_3);

							$.snippet(node_1, () => $$props.children);
							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				};

				var alternate = ($$anchor) => {
					var fragment_4 = $.comment();
					var node_2 = $.first_child(fragment_4);

					$.snippet(node_2, () => $$props.children);
					$.append($$anchor, fragment_4);
				};

				$.if(node, ($$render) => {
					if (simple()) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	}));

	$.pop();
}
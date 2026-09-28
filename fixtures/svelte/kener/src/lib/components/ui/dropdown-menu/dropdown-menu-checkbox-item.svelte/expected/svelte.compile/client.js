import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
import CheckIcon from "@lucide/svelte/icons/check";
import MinusIcon from "@lucide/svelte/icons/minus";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'checked',
	'indeterminate',
	'class',
	'children'
]);

var root = $.from_html(`<span class="pointer-events-none absolute start-2 flex size-3.5 items-center justify-center"><!></span> <!>`, 1);

export default function Dropdown_menu_checkbox_item($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		checked = $.prop($$props, 'checked', 15, false),
		indeterminate = $.prop($$props, 'indeterminate', 15, false),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const children = ($$anchor, $$arg0) => {
			let checked = () => ($$arg0?.()).checked;
			let indeterminate = () => ($$arg0?.()).indeterminate;
			var fragment_1 = root();
			var span = $.first_child(fragment_1);
			var node_1 = $.child(span);

			{
				var consequent = ($$anchor) => {
					MinusIcon($$anchor, { class: 'size-4' });
				};

				var alternate = ($$anchor) => {
					{
						let $0 = $.derived(() => cn("size-4", !checked() && "text-transparent"));

						CheckIcon($$anchor, {
							get class() {
								return $.get($0);
							}
						});
					}
				};

				$.if(node_1, ($$render) => {
					if (indeterminate()) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.reset(span);

			var node_2 = $.sibling(span, 2);

			$.snippet(node_2, () => $$props.children ?? $.noop);
			$.append($$anchor, fragment_1);
		};

		let $0 = $.derived(() => cn("focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 ps-8 pe-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", $$props.class));

		$.component(node, () => DropdownMenuPrimitive.CheckboxItem, ($$anchor, DropdownMenuPrimitive_CheckboxItem) => {
			DropdownMenuPrimitive_CheckboxItem($$anchor, $.spread_props(
				{
					'data-slot': 'dropdown-menu-checkbox-item',
					get class() {
						return $.get($0);
					}
				},
				() => restProps,
				{
					get ref() {
						return ref();
					},

					set ref($$value) {
						ref($$value);
					},

					get checked() {
						return checked();
					},

					set checked($$value) {
						checked($$value);
					},

					get indeterminate() {
						return indeterminate();
					},

					set indeterminate($$value) {
						indeterminate($$value);
					},
					children,
					$$slots: { default: true }
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}
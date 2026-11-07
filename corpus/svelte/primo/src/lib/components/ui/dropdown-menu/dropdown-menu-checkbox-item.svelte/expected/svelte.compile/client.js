import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
import Check from 'lucide-svelte/icons/check';
import Minus from 'lucide-svelte/icons/minus';
import { cn } from '$lib/utils.ts';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'children',
	'checked',
	'indeterminate'
]);

var root = $.from_html(`<span class="absolute left-2 flex size-3.5 items-center justify-center"><!></span> <!>`, 1);

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
					Minus($$anchor, { class: 'size-4' });
				};

				var alternate = ($$anchor) => {
					{
						let $0 = $.derived(() => cn('size-4', !checked() && 'text-transparent'));

						Check($$anchor, {
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

		let $0 = $.derived(() => cn('data-highlighted:bg-accent data-highlighted:text-accent-foreground relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-hidden data-disabled:pointer-events-none data-disabled:opacity-50', $$props.class));

		$.component(node, () => DropdownMenuPrimitive.CheckboxItem, ($$anchor, DropdownMenuPrimitive_CheckboxItem) => {
			DropdownMenuPrimitive_CheckboxItem($$anchor, $.spread_props(
				{
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
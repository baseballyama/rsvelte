import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';
import Check from '@lucide/svelte/icons/check';
import Minus from '@lucide/svelte/icons/minus';
import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'checked',
	'children',
	'class',
	'ref'
]);

var root = $.from_html(`<span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center"><!></span> <!>`, 1);

export default function Dropdown_menu_checkbox_item($$anchor, $$props) {
	$.push($$props, true);

	let checked = $.prop($$props, 'checked', 15, false),
		ref = $.prop($$props, 'ref', 15, null),
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

		let $0 = $.derived(() => cn('focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center rounded-md py-1.5 pr-2 pl-8 text-sm outline-hidden transition-colors select-none disabled:pointer-events-none disabled:opacity-50', $$props.class));

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
					children,
					$$slots: { default: true }
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
import { Check, Minus } from '@lucide/svelte';
import { cn } from '$lib/core/utils';

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
		className = $.prop($$props, 'class', 7),
		checked = $.prop($$props, 'checked', 15, false),
		indeterminate = $.prop($$props, 'indeterminate', 15, false),
		restProps = $.rest_props($$props, rest_excludes);

	var $$exports = {
		get class() {
			return className();
		},

		set class($$value) {
			className($$value);
		}
	};

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
					Minus($$anchor, { class: 'size-3.5' });
				};

				var alternate = ($$anchor) => {
					{
						let $0 = $.derived(() => cn('size-3.5', !checked() && 'text-transparent'));

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

			$.snippet(node_2, () => $$props.children ?? $.noop, () => ({ checked: checked(), indeterminate: indeterminate() }));
			$.append($$anchor, fragment_1);
		};

		let $0 = $.derived(() => cn('relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:opacity-50', className()));

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

	return $.pop($$exports);
}
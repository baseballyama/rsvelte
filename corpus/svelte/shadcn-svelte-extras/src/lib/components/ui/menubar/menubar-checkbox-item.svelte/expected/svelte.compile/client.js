import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Menubar as MenubarPrimitive } from 'bits-ui';
import { cn } from '$lib/utils.js';
import MinusIcon from '@lucide/svelte/icons/minus';
import CheckIcon from '@lucide/svelte/icons/check';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'checked',
	'indeterminate',
	'inset',
	'children'
]);

var root = $.from_html(`<span class="pointer-events-none absolute left-2 flex size-4 items-center justify-center [&amp;_svg:not([class*='size-'])]:size-4"><!></span> <!>`, 1);

export default function Menubar_checkbox_item($$anchor, $$props) {
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
					MinusIcon($$anchor, {});
				};

				var consequent_1 = ($$anchor) => {
					CheckIcon($$anchor, {});
				};

				$.if(node_1, ($$render) => {
					if (indeterminate()) $$render(consequent); else if (checked()) $$render(consequent_1, 1);
				});
			}

			$.reset(span);

			var node_2 = $.sibling(span, 2);

			$.snippet(node_2, () => $$props.children ?? $.noop);
			$.append($$anchor, fragment_1);
		};

		let $0 = $.derived(() => cn('focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-md py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-inset:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0', $$props.class));

		$.component(node, () => MenubarPrimitive.CheckboxItem, ($$anchor, MenubarPrimitive_CheckboxItem) => {
			MenubarPrimitive_CheckboxItem($$anchor, $.spread_props(
				{
					'data-slot': 'menubar-checkbox-item',
					get 'data-inset'() {
						return $$props.inset;
					},

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
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Menubar as MenubarPrimitive } from "bits-ui";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { cn } from "$lib/utils.js";

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

var root = $.from_html(`<span class="cn-menubar-checkbox-item-indicator pointer-events-none absolute flex items-center justify-center"><!></span> <!>`, 1);

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
					IconPlaceholder($$anchor, {
						lucide: 'MinusIcon',
						tabler: 'IconMinus',
						hugeicons: 'MinusSignIcon',
						phosphor: 'MinusIcon',
						remixicon: 'RiSubtractLine'
					});
				};

				var consequent_1 = ($$anchor) => {
					IconPlaceholder($$anchor, {
						lucide: 'CheckIcon',
						tabler: 'IconCheck',
						hugeicons: 'Tick02Icon',
						phosphor: 'CheckIcon',
						remixicon: 'RiCheckLine'
					});
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

		let $0 = $.derived(() => cn("cn-menubar-checkbox-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0", $$props.class));

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
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Checkbox as CheckboxPrimitive } from "bits-ui";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'checked',
	'indeterminate',
	'class'
]);

var root = $.from_html(`<div data-slot="checkbox-indicator" class="cn-checkbox-indicator grid place-content-center text-current transition-none"><!></div>`);

export default function Checkbox($$anchor, $$props) {
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
			var div = root();
			var node_1 = $.child(div);

			{
				var consequent = ($$anchor) => {
					IconPlaceholder($$anchor, {
						lucide: 'CheckIcon',
						tabler: 'IconCheck',
						hugeicons: 'Tick02Icon',
						phosphor: 'CheckIcon',
						remixicon: 'RiCheckLine'
					});
				};

				var consequent_1 = ($$anchor) => {
					IconPlaceholder($$anchor, {
						lucide: 'MinusIcon',
						tabler: 'IconMinus',
						hugeicons: 'MinusSignIcon',
						phosphor: 'MinusIcon',
						remixicon: 'RiSubtractLine'
					});
				};

				$.if(node_1, ($$render) => {
					if (checked()) $$render(consequent); else if (indeterminate()) $$render(consequent_1, 1);
				});
			}

			$.reset(div);
			$.append($$anchor, div);
		};

		let $0 = $.derived(() => cn("cn-checkbox peer relative shrink-0 outline-none after:absolute after:-inset-x-3 after:-inset-y-2 disabled:cursor-not-allowed disabled:opacity-50", $$props.class));

		$.component(node, () => CheckboxPrimitive.Root, ($$anchor, CheckboxPrimitive_Root) => {
			CheckboxPrimitive_Root($$anchor, $.spread_props(
				{
					'data-slot': 'checkbox',
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
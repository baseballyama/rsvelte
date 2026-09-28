import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Checkbox as CheckboxPrimitive } from "bits-ui";
import CheckIcon from "@lucide/svelte/icons/check";
import MinusIcon from "@lucide/svelte/icons/minus";
import { cn } from "$lib/utils";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'checked',
	'indeterminate',
	'class'
]);

var root = $.from_html(`<div data-slot="checkbox-indicator" class="text-current transition-none"><!></div>`);

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
					CheckIcon($$anchor, { class: 'size-3.5' });
				};

				var consequent_1 = ($$anchor) => {
					MinusIcon($$anchor, { class: 'size-3.5' });
				};

				$.if(node_1, ($$render) => {
					if (checked()) $$render(consequent); else if (indeterminate()) $$render(consequent_1, 1);
				});
			}

			$.reset(div);
			$.append($$anchor, div);
		};

		let $0 = $.derived(() => cn("peer flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input shadow-xs transition-shadow outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:bg-input/30 dark:aria-invalid:ring-destructive/40 dark:data-[state=checked]:bg-primary", $$props.class));

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
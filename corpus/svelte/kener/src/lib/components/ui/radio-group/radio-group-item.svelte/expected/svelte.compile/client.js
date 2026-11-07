import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RadioGroup as RadioGroupPrimitive } from "bits-ui";
import CircleIcon from "@lucide/svelte/icons/circle";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'class']);
var root = $.from_html(`<div data-slot="radio-group-indicator" class="relative flex items-center justify-center"><!></div>`);

export default function Radio_group_item($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const children = ($$anchor, $$arg0) => {
			let checked = () => ($$arg0?.()).checked;
			var div = root();
			var node_1 = $.child(div);

			{
				var consequent = ($$anchor) => {
					CircleIcon($$anchor, {
						class: 'fill-primary absolute start-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2'
					});
				};

				$.if(node_1, ($$render) => {
					if (checked()) $$render(consequent);
				});
			}

			$.reset(div);
			$.append($$anchor, div);
		};

		let $0 = $.derived(() => cn("border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50", $$props.class));

		$.component(node, () => RadioGroupPrimitive.Item, ($$anchor, RadioGroupPrimitive_Item) => {
			RadioGroupPrimitive_Item($$anchor, $.spread_props(
				{
					'data-slot': 'radio-group-item',
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
					children,
					$$slots: { default: true }
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}
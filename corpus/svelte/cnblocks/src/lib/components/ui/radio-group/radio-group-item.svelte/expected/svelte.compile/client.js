import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RadioGroup as RadioGroupPrimitive } from "bits-ui";
import Circle from "@lucide/svelte/icons/circle";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'class']);
var root = $.from_html(`<div class="flex items-center justify-center"><!></div>`);

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
					Circle($$anchor, { class: 'size-3.5 fill-primary' });
				};

				$.if(node_1, ($$render) => {
					if (checked()) $$render(consequent);
				});
			}

			$.reset(div);
			$.append($$anchor, div);
		};

		let $0 = $.derived(() => cn("aspect-square size-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50", $$props.class));

		$.component(node, () => RadioGroupPrimitive.Item, ($$anchor, RadioGroupPrimitive_Item) => {
			RadioGroupPrimitive_Item($$anchor, $.spread_props(
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
					children,
					$$slots: { default: true }
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}
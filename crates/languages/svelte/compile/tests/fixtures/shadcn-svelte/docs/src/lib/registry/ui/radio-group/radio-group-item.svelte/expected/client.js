import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RadioGroup as RadioGroupPrimitive } from "bits-ui";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'class']);
var root = $.from_html(`<div data-slot="radio-group-indicator" class="cn-radio-group-indicator"><!></div>`);

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
					IconPlaceholder($$anchor, {
						lucide: 'CircleIcon',
						tabler: 'IconCircle',
						hugeicons: 'CircleIcon',
						phosphor: 'CircleIcon',
						remixicon: 'RiCircleLine',
						class: 'cn-radio-group-indicator-icon'
					});
				};

				$.if(node_1, ($$render) => {
					if (checked()) $$render(consequent);
				});
			}

			$.reset(div);
			$.append($$anchor, div);
		};

		let $0 = $.derived(() => cn("cn-radio-group-item group/radio-group-item peer relative aspect-square shrink-0 border outline-none after:absolute after:-inset-x-3 after:-inset-y-2 disabled:cursor-not-allowed disabled:opacity-50", $$props.class));

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
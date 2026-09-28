import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Select as SelectPrimitive } from "bits-ui";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'value',
	'label',
	'children'
]);

var root = $.from_html(`<span class="absolute end-2 flex size-3.5 items-center justify-center"><!></span> <span class="cn-select-item-text shrink-0 whitespace-nowrap"><!></span>`, 1);

export default function Select_item($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const children = ($$anchor, $$arg0) => {
			let selected = () => ($$arg0?.()).selected;
			let highlighted = () => ($$arg0?.()).highlighted;
			var fragment_1 = root();
			var span = $.first_child(fragment_1);
			var node_1 = $.child(span);

			{
				var consequent = ($$anchor) => {
					IconPlaceholder($$anchor, {
						lucide: 'CheckIcon',
						tabler: 'IconCheck',
						hugeicons: 'Tick02Icon',
						phosphor: 'CheckIcon',
						remixicon: 'RiCheckLine',
						class: 'cn-select-item-indicator-icon'
					});
				};

				$.if(node_1, ($$render) => {
					if (selected()) $$render(consequent);
				});
			}

			$.reset(span);

			var span_1 = $.sibling(span, 2);
			var node_2 = $.child(span_1);

			{
				var consequent_1 = ($$anchor) => {
					var fragment_3 = $.comment();
					var node_3 = $.first_child(fragment_3);

					$.snippet(node_3, () => $$props.children, () => ({ selected: selected(), highlighted: highlighted() }));
					$.append($$anchor, fragment_3);
				};

				var alternate = ($$anchor) => {
					var text = $.text();

					$.template_effect(() => $.set_text(text, $$props.label || $$props.value));
					$.append($$anchor, text);
				};

				$.if(node_2, ($$render) => {
					if ($$props.children) $$render(consequent_1); else $$render(alternate, -1);
				});
			}

			$.reset(span_1);
			$.append($$anchor, fragment_1);
		};

		let $0 = $.derived(() => cn("cn-select-item relative flex w-full cursor-default items-center outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-highlighted:bg-accent data-highlighted:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0", $$props.class));

		$.component(node, () => SelectPrimitive.Item, ($$anchor, SelectPrimitive_Item) => {
			SelectPrimitive_Item($$anchor, $.spread_props(
				{
					get value() {
						return $$props.value;
					},
					'data-slot': 'select-item',
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
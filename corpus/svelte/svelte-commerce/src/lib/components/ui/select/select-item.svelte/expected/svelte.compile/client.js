import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Select as SelectPrimitive } from 'bits-ui';
import { Check } from '@lucide/svelte';
import { cn } from '$lib/core/utils';

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

var root = $.from_html(`<span class="absolute right-2 flex size-3.5 items-center justify-center"><!></span> <!>`, 1);

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
					Check($$anchor, { class: 'size-4' });
				};

				$.if(node_1, ($$render) => {
					if (selected()) $$render(consequent);
				});
			}

			$.reset(span);

			var node_2 = $.sibling(span, 2);

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

			$.append($$anchor, fragment_1);
		};

		let $0 = $.derived(() => cn('relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:opacity-50', $$props.class));

		$.component(node, () => SelectPrimitive.Item, ($$anchor, SelectPrimitive_Item) => {
			SelectPrimitive_Item($$anchor, $.spread_props(
				{
					get value() {
						return $$props.value;
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
					children,
					$$slots: { default: true }
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}
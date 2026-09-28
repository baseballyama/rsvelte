import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';
import Check from '@lucide/svelte/icons/check';
import { Select as SelectPrimitive } from 'bits-ui';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'class',
	'label',
	'ref',
	'value'
]);

var root = $.from_html(`<span class="absolute left-2 flex size-3.5 items-center justify-center"><!></span> <span><!></span>`, 1);

export default function Select_item($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const children = ($$anchor, $$arg0) => {
			let highlighted = () => ($$arg0?.()).highlighted;
			let selected = () => ($$arg0?.()).selected;
			var fragment_1 = root();
			var span = $.first_child(fragment_1);
			var node_1 = $.child(span);

			{
				var consequent = ($$anchor) => {
					Check($$anchor, { size: 16 });
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

					$.snippet(node_3, () => $$props.children, () => ({ highlighted: highlighted(), selected: selected() }));
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

		let $0 = $.derived(() => cn('data-highlighted:bg-accent data-highlighted:text-accent-foreground relative flex w-full cursor-default items-center rounded-md py-1.5 pr-2 pl-8 text-sm outline-hidden select-none disabled:pointer-events-none disabled:opacity-50', $$props.class));

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
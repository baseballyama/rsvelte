import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Menubar as MenubarPrimitive } from 'bits-ui';
import { cn } from '$lib/utils.js';
import CheckIcon from '@lucide/svelte/icons/check';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'inset',
	'children'
]);

var root = $.from_html(`<span class="pointer-events-none absolute left-2 flex size-4 items-center justify-center [&amp;_svg:not([class*='size-'])]:size-4"><!></span> <!>`, 1);

export default function Menubar_radio_item($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const children = ($$anchor, $$arg0) => {
			let checked = () => ($$arg0?.()).checked;
			var fragment_1 = root();
			var span = $.first_child(fragment_1);
			var node_1 = $.child(span);

			{
				var consequent = ($$anchor) => {
					CheckIcon($$anchor, {});
				};

				$.if(node_1, ($$render) => {
					if (checked()) $$render(consequent);
				});
			}

			$.reset(span);

			var node_2 = $.sibling(span, 2);

			$.snippet(node_2, () => $$props.children ?? $.noop, () => ({ checked: checked() }));
			$.append($$anchor, fragment_1);
		};

		let $0 = $.derived(() => cn("focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-md py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-inset:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", $$props.class));

		$.component(node, () => MenubarPrimitive.RadioItem, ($$anchor, MenubarPrimitive_RadioItem) => {
			MenubarPrimitive_RadioItem($$anchor, $.spread_props(
				{
					'data-slot': 'menubar-radio-item',
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
					children,
					$$slots: { default: true }
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}
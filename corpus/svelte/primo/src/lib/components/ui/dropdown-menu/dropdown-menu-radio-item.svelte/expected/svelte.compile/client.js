import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
import Circle from 'lucide-svelte/icons/circle';
import { cn } from '$lib/utils.ts';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'children'
]);

var root = $.from_html(`<span class="absolute left-2 flex size-3.5 items-center justify-center"><!></span> <!>`, 1);

export default function Dropdown_menu_radio_item($$anchor, $$props) {
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
					Circle($$anchor, { class: 'size-2 fill-current' });
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

		let $0 = $.derived(() => cn('data-highlighted:bg-accent data-highlighted:text-accent-foreground relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-hidden data-disabled:pointer-events-none data-disabled:opacity-50', $$props.class));

		$.component(node, () => DropdownMenuPrimitive.RadioItem, ($$anchor, DropdownMenuPrimitive_RadioItem) => {
			DropdownMenuPrimitive_RadioItem($$anchor, $.spread_props(
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
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Command from "$lib/registry/ui/command/index.js";
import { useMutationObserver } from "$lib/hooks/use-mutation-observer.svelte.js";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'ref',
	'class',
	'onHighlight'
]);

export default function Command_menu_item($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	useMutationObserver(
		() => ref(),
		(mutations) => {
			for (const mutation of mutations) {
				if (mutation.type === "attributes" && mutation.attributeName === "aria-selected" && ref()?.getAttribute("aria-selected") === "true") {
					$$props.onHighlight?.();
				}
			}
		},
		{ attributes: true }
	);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn("h-9 rounded-md border border-transparent !px-3 font-medium data-[selected=true]:border-input data-[selected=true]:bg-input/50", $$props.class));

		$.component(node, () => Command.Item, ($$anchor, Command_Item) => {
			Command_Item($$anchor, $.spread_props(
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

					children: ($$anchor, $$slotProps) => {
						var fragment_1 = $.comment();
						var node_1 = $.first_child(fragment_1);

						$.snippet(node_1, () => $$props.children ?? $.noop);
						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}
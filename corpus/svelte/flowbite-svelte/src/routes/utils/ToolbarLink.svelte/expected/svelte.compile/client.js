import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ToolbarButton from "$lib/toolbar/ToolbarButton.svelte";
import Tooltip from "$lib/tooltip/Tooltip.svelte";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children', 'name']);
var root = $.from_html(`<!> <!>`, 1);

export default function ToolbarLink($$anchor, $$props) {
	let restProps = $.rest_props($$props, rest_excludes);
	var fragment = root();
	var node = $.first_child(fragment);

	ToolbarButton(node, $.spread_props(
		{
			get name() {
				return $$props.name;
			},
			size: 'lg',
			target: '_blank',
			rel: 'noreferrer'
		},
		() => restProps,
		{
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.snippet(node_1, () => $$props.children);
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}
	));

	var node_2 = $.sibling(node, 2);

	Tooltip(node_2, {
		class: 'dark:bg-gray-900',
		placement: 'bottom',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text();

			$.template_effect(() => $.set_text(text, $$props.name));
			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}
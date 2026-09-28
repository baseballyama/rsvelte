import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import BoldIcon from '@lucide/svelte/icons/bold';
import ItalicIcon from '@lucide/svelte/icons/italic';
import UnderlineIcon from '@lucide/svelte/icons/underline';
import { ToggleGroup } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex flex-col items-center gap-4"><!> <p><span class="opacity-60">You selected</span> <code class="code"> </code></p></div>`);

export default function Controlled($$anchor) {
	let value = $.state($.proxy(['bold']));
	var div = root_1();
	var node = $.child(div);

	ToggleGroup(node, {
		get value() {
			return $.get(value);
		},
		onValueChange: (details) => $.set(value, details.value, true),
		multiple: true,
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			$.component(node_1, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item) => {
				ToggleGroup_Item($$anchor, {
					value: 'bold',
					children: ($$anchor, $$slotProps) => {
						BoldIcon($$anchor, { class: 'size-4' });
					},
					$$slots: { default: true }
				});
			});

			var node_2 = $.sibling(node_1, 2);

			$.component(node_2, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_1) => {
				ToggleGroup_Item_1($$anchor, {
					value: 'italic',
					children: ($$anchor, $$slotProps) => {
						ItalicIcon($$anchor, { class: 'size-4' });
					},
					$$slots: { default: true }
				});
			});

			var node_3 = $.sibling(node_2, 2);

			$.component(node_3, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_2) => {
				ToggleGroup_Item_2($$anchor, {
					value: 'underline',
					children: ($$anchor, $$slotProps) => {
						UnderlineIcon($$anchor, { class: 'size-4' });
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var p = $.sibling(node, 2);
	var code = $.sibling($.child(p), 2);
	var text = $.only_child(code, true);

	$.reset(p);
	$.reset(div);

	$.template_effect(($0) => $.set_text(text, $0), [
		() => $.get(value).length > 0 ? $.get(value).join(', ') : 'none'
	]);

	$.append($$anchor, div);
}
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SelectContent } from '$lib/components/ui/select';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'align', 'children']);

export default function Split_button_content($$anchor, $$props) {
	let align = $.prop($$props, 'align', 3, 'end'),
		restProps = $.rest_props($$props, rest_excludes);

	SelectContent($$anchor, $.spread_props(
		{
			'data-slot': 'split-button-content',
			get align() {
				return align();
			},
			class: 'p-2'
		},
		() => restProps,
		{
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				$.snippet(node, () => $$props.children ?? $.noop);
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}
	));
}
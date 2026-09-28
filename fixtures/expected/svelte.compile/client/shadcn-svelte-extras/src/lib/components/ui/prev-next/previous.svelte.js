import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
import { cn } from '$lib/utils.js';
import Button from '$lib/components/button.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children', 'class']);
var root = $.from_html(`<!> <!>`, 1);

export default function Previous($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);

	{
		let $0 = $.derived(() => cn('flex place-items-center gap-2 pr-4 pl-2', $$props.class));

		Button($$anchor, $.spread_props(
			{
				get class() {
					return $.get($0);
				},
				variant: 'outline',
				size: 'sm'
			},
			() => rest,
			{
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node = $.first_child(fragment_1);

					ChevronLeftIcon(node, { class: 'size-4' });

					var node_1 = $.sibling(node, 2);

					$.snippet(node_1, () => $$props.children);
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			}
		));
	}

	$.pop();
}
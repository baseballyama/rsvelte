import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
import { cn } from '$lib/utils.js';
import Button from '$lib/components/button.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children', 'class']);
var root = $.from_html(`<!> <!>`, 1);

export default function Next($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);

	{
		let $0 = $.derived(() => cn('flex place-items-center gap-2 pr-2 pl-4', $$props.class));

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

					$.snippet(node, () => $$props.children);

					var node_1 = $.sibling(node, 2);

					ChevronRightIcon(node_1, { class: 'size-4' });
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			}
		));
	}

	$.pop();
}
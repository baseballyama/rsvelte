import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from '$lib/components/ui/button/index.js';
import { cn } from '$lib/utils.ts';
import { PanelLeft } from 'lucide-svelte';
import { useSidebar } from './context.svelte.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'class', 'onclick']);
var root = $.from_html(`<!> <span class="sr-only">Toggle Sidebar</span>`, 1);

export default function Sidebar_trigger($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 11, null),
		restProps = $.rest_props($$props, rest_excludes);

	const sidebar = useSidebar();

	{
		let $0 = $.derived(() => cn('h-7 w-7', $$props.class));

		Button($$anchor, $.spread_props(
			{
				type: 'button',
				onclick: (e) => {
					$$props.onclick?.(e);
					sidebar.toggle();
				},
				'data-sidebar': 'trigger',
				variant: 'ghost',
				size: 'icon',
				get class() {
					return $.get($0);
				}
			},
			() => restProps,
			{
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node = $.first_child(fragment_1);

					PanelLeft(node, {});
					$.next(2);
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			}
		));
	}

	$.pop();
}
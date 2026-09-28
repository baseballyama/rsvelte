import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from '$lib/components/ui/button/index.js';
import PanelLeftIcon from '@lucide/svelte/icons/panel-left';
import { cn } from '$lib/utils.js';
import { useSidebar } from './context.svelte.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'class', 'onclick']);
var root = $.from_html(`<!> <span class="sr-only">Toggle Sidebar</span>`, 1);

export default function Sidebar_trigger($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	const sidebar = useSidebar();

	{
		let $0 = $.derived(() => cn('cn-sidebar-trigger', $$props.class));

		Button($$anchor, $.spread_props(
			{
				'data-sidebar': 'trigger',
				'data-slot': 'sidebar-trigger',
				variant: 'ghost',
				size: 'icon-sm',
				get class() {
					return $.get($0);
				},
				type: 'button',
				onclick: (e) => {
					$$props.onclick?.(e);
					sidebar.toggle();
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
					var fragment_1 = root();
					var node = $.first_child(fragment_1);

					PanelLeftIcon(node, {});
					$.next(2);
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			}
		));
	}

	$.pop();
}
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as ToggleGroup from '$lib/components/ui/toggle-group';
import TabletIcon from '@lucide/svelte/icons/tablet';
import { cn } from '$lib/utils.js';
import { controlVariants } from './index.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'value', 'class']);

export default function Demo_control_size_tablet($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		value = $.prop($$props, 'value', 3, 50),
		rest = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => value().toString());
		let $1 = $.derived(() => cn(controlVariants(), $$props.class));

		$.component(node, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item) => {
			ToggleGroup_Item($$anchor, $.spread_props(
				{
					'aria-label': 'Tablet',
					get value() {
						return $.get($0);
					},

					get class() {
						return $.get($1);
					}
				},
				() => rest,
				{
					get ref() {
						return ref();
					},

					set ref($$value) {
						ref($$value);
					},

					children: ($$anchor, $$slotProps) => {
						TabletIcon($$anchor, {});
					},
					$$slots: { default: true }
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}
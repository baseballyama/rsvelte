import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';
import * as ToggleGroup from '$lib/components/ui/toggle-group';
import { useDemoControlGroup } from './demo.svelte.js';
import { box } from 'svelte-toolbelt';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'type',
	'class',
	'children'
]);

export default function Demo_control_group($$anchor, $$props) {
	$.push($$props, true);

	let // this is just here to satisfy the types
		type = $.prop($$props, 'type', 3, 'single'),
		rest = $.rest_props($$props, rest_excludes);

	let value = $.state(100);

	const controlGroupState = useDemoControlGroup({
		size: box.with(() => $.get(value), (v) => $.set(value, v, true))
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => $.get(value).toString());
		let $1 = $.derived(() => cn('border-border hidden h-9 gap-0.5 rounded-md border p-0.5 md:flex', $$props.class));

		$.component(node, () => ToggleGroup.Root, ($$anchor, ToggleGroup_Root) => {
			ToggleGroup_Root($$anchor, $.spread_props(
				{
					get type() {
						return type();
					},

					get value() {
						return $.get($0);
					},
					onValueChange: (value) => controlGroupState.onValueChange(parseInt(value)),
					get class() {
						return $.get($1);
					}
				},
				() => rest,
				{
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
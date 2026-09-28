import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Tabs from '$lib/components/ui/tabs';
import { cn } from '$lib/utils';
import { Tabs as TabsPrimitive } from 'bits-ui';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'class']);
var root = $.from_html(`<!> <!>`, 1);

export default function Demo_tabs($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		rest = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn('border-border bg-background h-9 rounded-md border', $$props.class));

		$.component(node, () => Tabs.List, ($$anchor, Tabs_List) => {
			Tabs_List($$anchor, $.spread_props(
				{
					'data-slot': 'demo-tabs',
					get class() {
						return $.get($0);
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
						var fragment_1 = root();
						var node_1 = $.first_child(fragment_1);

						$.component(node_1, () => Tabs.Trigger, ($$anchor, Tabs_Trigger) => {
							Tabs_Trigger($$anchor, {
								value: 'preview',
								class: 'bg-background data-[state=active]:bg-accent! rounded-sm border-none',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Preview');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_1) => {
							Tabs_Trigger_1($$anchor, {
								value: 'code',
								class: 'bg-background data-[state=active]:bg-accent! rounded-sm border-none',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Code');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
						});

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
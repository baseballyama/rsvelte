import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '$lib/components/ui/label.svelte';
import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group/index.js';

var root = $.from_html(`<div class="border-input has-data-[state=checked]:border-ring relative flex flex-col items-start gap-4 rounded-lg border p-3 shadow-xs shadow-black/[.04]"><div class="flex items-center gap-2"><!> <!></div></div>`);
var root_1 = $.from_html(`<fieldset class="space-y-4"><legend class="text-foreground text-sm leading-none font-medium">Server location</legend> <!></fieldset>`);

export default function Radio_14($$anchor) {
	const items = [
		{ id: 'radio-14-r1', label: 'USA', value: 'r1' },
		{ id: 'radio-14-r2', label: 'UK', value: 'r2' },
		{ id: 'radio-14-r3', label: 'France', value: 'r3' }
	];

	var fieldset = root_1();
	var node = $.sibling($.child(fieldset), 2);

	RadioGroup(node, {
		class: 'flex flex-wrap gap-2',
		value: 'r1',
		children: ($$anchor, $$slotProps) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.each(node_1, 17, () => items, (item) => item.id, ($$anchor, item) => {
				var div = root();
				var div_1 = $.child(div);
				var node_2 = $.child(div_1);

				RadioGroupItem(node_2, {
					get id() {
						return $.get(item).id;
					},

					get value() {
						return $.get(item).value;
					},
					class: 'after:absolute after:inset-0'
				});

				var node_3 = $.sibling(node_2, 2);

				Label(node_3, {
					get for() {
						return $.get(item).id;
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text();

						$.template_effect(() => $.set_text(text, $.get(item).label));
						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				$.reset(div_1);
				$.reset(div);
				$.append($$anchor, div);
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(fieldset);
	$.append($$anchor, fieldset);
}
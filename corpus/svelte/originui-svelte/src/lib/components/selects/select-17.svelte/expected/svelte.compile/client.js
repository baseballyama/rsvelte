import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '$lib/components/ui/label.svelte';
import * as Select from '$lib/components/ui/select/index.js';
import Clock from '@lucide/svelte/icons/clock';

var root = $.from_html(`<div class="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 group-has-[[disabled]]:opacity-50"><!></div> `, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="space-y-2"><!> <!></div>`);

export default function Select_17($$anchor) {
	const uid = $.props_id();

	const items = [
		{ label: '00:00 AM - 11:59 PM', value: 's1' },
		{ label: '01:00 AM - 12:59 PM', value: 's2' },
		{ label: '02:00 AM - 01:59 PM', value: 's3' },
		{ label: '03:00 AM - 02:59 PM', value: 's4' }
	];

	let value = $.state('s1');
	const selected = $.derived(() => items.find((i) => i.value === $.get(value)));
	var div = root_2();
	var node = $.child(div);

	Label(node, {
		get for() {
			return uid;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Select with icon');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => Select.Root, ($$anchor, Select_Root) => {
		Select_Root($$anchor, {
			type: 'single',
			get value() {
				return $.get(value);
			},

			set value($$value) {
				$.set(value, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root_1();
				var node_2 = $.first_child(fragment);

				$.component(node_2, () => Select.Trigger, ($$anchor, Select_Trigger) => {
					Select_Trigger($$anchor, {
						class: 'relative ps-9',
						get id() {
							return uid;
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root();
							var div_1 = $.first_child(fragment_1);
							var node_3 = $.child(div_1);

							Clock(node_3, { size: 16, 'aria-hidden': 'true' });
							$.reset(div_1);

							var text_1 = $.sibling(div_1);

							$.template_effect(() => $.set_text(text_1, ` ${$.get(selected)?.label ?? 'Select a time' ?? ''}`));
							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				var node_4 = $.sibling(node_2, 2);

				$.component(node_4, () => Select.Content, ($$anchor, Select_Content) => {
					Select_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_5 = $.first_child(fragment_2);

							$.each(node_5, 17, () => items, (item) => item.value, ($$anchor, item) => {
								var fragment_3 = $.comment();
								var node_6 = $.first_child(fragment_3);

								$.component(node_6, () => Select.Item, ($$anchor, Select_Item) => {
									Select_Item($$anchor, {
										get value() {
											return $.get(item).value;
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text();

											$.template_effect(() => $.set_text(text_2, $.get(item).label));
											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_3);
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}
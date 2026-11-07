import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '$lib/components/ui/label.svelte';
import * as Select from '$lib/components/ui/select/index.js';

var root = $.from_html(` <span class="text-muted-foreground mt-1 block text-xs"> </span>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="space-y-2"><!> <!></div>`);

export default function Select_36($$anchor) {
	const uid = $.props_id();

	const items = [
		{
			description: 'Ideal for individuals',
			label: 'Standard Plan',
			value: 's1'
		},

		{
			description: 'For professional users',
			label: 'Pro Plan',
			value: 's2'
		},

		{
			description: 'Built for large teams',
			label: 'Enterprise Plan',
			value: 's3'
		}
	];

	let value = $.state('s2');
	const selected = $.derived(() => items.find((i) => i.value === $.get(value)));
	var div = root_2();
	var node = $.child(div);

	Label(node, {
		get for() {
			return uid;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Select with description and right indicator');

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
						get id() {
							return uid;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text();

							$.template_effect(() => $.set_text(text_1, $.get(selected)?.label ?? 'Select a plan'));
							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				});

				var node_3 = $.sibling(node_2, 2);

				$.component(node_3, () => Select.Content, ($$anchor, Select_Content) => {
					Select_Content($$anchor, {
						class: '[&_*[data-select-item]]:ps-2 [&_*[data-select-item]]:pe-8 [&_*[data-select-item]>span]:start-auto [&_*[data-select-item]>span]:end-2',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_4 = $.first_child(fragment_2);

							$.each(node_4, 17, () => items, (item) => item.value, ($$anchor, item) => {
								var fragment_3 = $.comment();
								var node_5 = $.first_child(fragment_3);

								$.component(node_5, () => Select.Item, ($$anchor, Select_Item) => {
									Select_Item($$anchor, {
										get value() {
											return $.get(item).value;
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var fragment_4 = root();
											var text_2 = $.first_child(fragment_4);
											var span = $.sibling(text_2);
											var text_3 = $.only_child(span, true);

											$.template_effect(() => {
												$.set_text(text_2, `${$.get(item).label ?? ''} `);
												$.set_text(text_3, $.get(item).description);
											});

											$.append($$anchor, fragment_4);
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
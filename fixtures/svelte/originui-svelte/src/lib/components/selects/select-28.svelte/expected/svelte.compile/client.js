import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '$lib/components/ui/label.svelte';
import * as Select from '$lib/components/ui/select/index.js';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="group relative"><!> <!></div>`);

export default function Select_28($$anchor) {
	const uid = $.props_id();

	const items = [
		{ label: 'Svelte', value: 's1' },
		{ label: 'Next.js', value: 's2' },
		{ label: 'Astro', value: 's3' },
		{ label: 'Gatsby', value: 's4' }
	];

	let value = $.state('');
	const selected = $.derived(() => items.find((i) => i.value === $.get(value)));
	var div = root_1();
	var node = $.child(div);

	Label(node, {
		get for() {
			return uid;
		},
		class: 'bg-background text-foreground absolute start-1 top-0 z-10 block -translate-y-1/2 px-2 text-xs font-medium group-has-disabled:opacity-50',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Select with overlapping label');

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
				var fragment = root();
				var node_2 = $.first_child(fragment);

				$.component(node_2, () => Select.Trigger, ($$anchor, Select_Trigger) => {
					Select_Trigger($$anchor, {
						get id() {
							return uid;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text();

							$.template_effect(() => $.set_text(text_1, $.get(selected)?.label ?? 'Select a framework'));
							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				});

				var node_3 = $.sibling(node_2, 2);

				$.component(node_3, () => Select.Content, ($$anchor, Select_Content) => {
					Select_Content($$anchor, {
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
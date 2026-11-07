import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '$lib/components/ui/label.svelte';
import * as Select from '$lib/components/ui/select/index.js';
import MonitorCog from '@lucide/svelte/icons/monitor-cog';
import Moon from '@lucide/svelte/icons/moon';
import Sun from '@lucide/svelte/icons/sun';

const theme = ($$anchor, item = $.noop) => {
	var fragment = root();
	var node = $.first_child(fragment);

	$.component(node, () => item().icon, ($$anchor, item_icon) => {
		item_icon($$anchor, { size: 16, 'aria-hidden': 'true' });
	});

	var span = $.sibling(node, 2);
	var text = $.only_child(span, true);

	$.template_effect(() => $.set_text(text, item().label));
	$.append($$anchor, fragment);
};

var root = $.from_html(`<!> <span class="truncate"> </span>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="space-y-2"><!> <!></div>`);

export default function Select_34($$anchor) {
	const uid = $.props_id();

	const items = [
		{ icon: Sun, label: 'Light', value: 's1' },
		{ icon: Moon, label: 'Dark', value: 's2' },
		{ icon: MonitorCog, label: 'System', value: 's3' }
	];

	let value = $.state('s1');
	const selected = $.derived(() => items.find((i) => i.value === $.get(value)));
	var div = root_2();
	var node_1 = $.child(div);

	Label(node_1, {
		get for() {
			return uid;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Options with icon');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => Select.Root, ($$anchor, Select_Root) => {
		Select_Root($$anchor, {
			type: 'single',
			get value() {
				return $.get(value);
			},

			set value($$value) {
				$.set(value, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_3 = $.first_child(fragment_1);

				$.component(node_3, () => Select.Trigger, ($$anchor, Select_Trigger) => {
					Select_Trigger($$anchor, {
						get id() {
							return uid;
						},
						class: '[&>span_svg]:text-muted-foreground/80 [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_svg]:shrink-0',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_4 = $.first_child(fragment_2);

							{
								var consequent = ($$anchor) => {
									theme($$anchor, () => $.get(selected));
								};

								var alternate = ($$anchor) => {
									var text_2 = $.text('Select a theme');

									$.append($$anchor, text_2);
								};

								$.if(node_4, ($$render) => {
									if ($.get(selected)) $$render(consequent); else $$render(alternate, -1);
								});
							}

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_5 = $.sibling(node_3, 2);

				$.component(node_5, () => Select.Content, ($$anchor, Select_Content) => {
					Select_Content($$anchor, {
						class: '[&_*[data-select-item]>span>svg]:text-muted-foreground/80 [&_*[data-select-item]>span]:flex [&_*[data-select-item]>span]:gap-2 [&_*[data-select-item]>span>svg]:shrink-0',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = $.comment();
							var node_6 = $.first_child(fragment_4);

							$.each(node_6, 17, () => items, (item) => item.value, ($$anchor, item) => {
								var fragment_5 = $.comment();
								var node_7 = $.first_child(fragment_5);

								$.component(node_7, () => Select.Item, ($$anchor, Select_Item) => {
									Select_Item($$anchor, {
										get value() {
											return $.get(item).value;
										},

										children: ($$anchor, $$slotProps) => {
											theme($$anchor, () => $.get(item));
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_5);
							});

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}
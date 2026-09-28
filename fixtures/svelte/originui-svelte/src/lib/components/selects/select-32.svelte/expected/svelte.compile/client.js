import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '$lib/components/ui/label.svelte';
import * as Select from '$lib/components/ui/select/index.js';

const status = ($$anchor, item = $.noop) => {
	var span = root();
	var svg = $.child(span);
	var span_1 = $.sibling(svg, 2);
	var text = $.only_child(span_1, true);

	$.reset(span);

	$.template_effect(() => {
		$.set_class(svg, 0, $.clsx(item().class));
		$.set_text(text, item().label);
	});

	$.append($$anchor, span);
};

var root = $.from_html(`<span class="flex items-center gap-2"><svg width="8" height="8" fill="currentColor" viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="4" cy="4" r="4"></circle></svg> <span class="truncate"> </span></span>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="space-y-2"><!> <!></div>`);

export default function Select_32($$anchor) {
	const uid = $.props_id();

	const items = [
		{ class: 'text-emerald-600', label: 'Completed', value: 's1' },
		{ class: 'text-blue-500', label: 'In Progress', value: 's2' },
		{ class: 'text-amber-500', label: 'Pending', value: 's3' },
		{ class: 'text-gray-500', label: 'Cancelled', value: 's4' },
		{ class: 'text-red-500', label: 'Failed', value: 's5' }
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

			var text_1 = $.text('Status select');

			$.append($$anchor, text_1);
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
						class: '[&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_svg]:shrink-0',
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = $.comment();
							var node_3 = $.first_child(fragment_1);

							{
								var consequent = ($$anchor) => {
									status($$anchor, () => $.get(selected));
								};

								var alternate = ($$anchor) => {
									var text_2 = $.text('Select a status');

									$.append($$anchor, text_2);
								};

								$.if(node_3, ($$render) => {
									if ($.get(selected)) $$render(consequent); else $$render(alternate, -1);
								});
							}

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				var node_4 = $.sibling(node_2, 2);

				$.component(node_4, () => Select.Content, ($$anchor, Select_Content) => {
					Select_Content($$anchor, {
						class: '[&_*[data-select-item]>span>svg]:text-muted-foreground/80 [&_*[data-select-item]]:ps-2 [&_*[data-select-item]]:pe-8 [&_*[data-select-item]>span]:start-auto [&_*[data-select-item]>span]:end-2 [&_*[data-select-item]>span]:flex [&_*[data-select-item]>span]:items-center [&_*[data-select-item]>span]:gap-2 [&_*[data-select-item]>span>svg]:shrink-0',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_5 = $.first_child(fragment_3);

							$.each(node_5, 17, () => items, (item) => item.value, ($$anchor, item) => {
								var fragment_4 = $.comment();
								var node_6 = $.first_child(fragment_4);

								$.component(node_6, () => Select.Item, ($$anchor, Select_Item) => {
									Select_Item($$anchor, {
										get value() {
											return $.get(item).value;
										},

										children: ($$anchor, $$slotProps) => {
											status($$anchor, () => $.get(item));
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_4);
							});

							$.append($$anchor, fragment_3);
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
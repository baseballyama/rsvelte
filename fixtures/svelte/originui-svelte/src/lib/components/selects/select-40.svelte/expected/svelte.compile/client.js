import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '$lib/components/ui/label.svelte';
import * as Select from '$lib/components/ui/select/index.js';
import { cn } from '$lib/utils.js';
import Avatar01 from '$lib/assets/avatar-40-01.jpg?w=80&h=80&enhanced';
import Avatar02 from '$lib/assets/avatar-40-02.jpg?w=80&h=80&enhanced';
import Avatar03 from '$lib/assets/avatar-40-03.jpg?w=80&h=80&enhanced';

const user = ($$anchor, item = $.noop) => {
	var span = root();
	var enhanced_img = $.child(span);
	var span_1 = $.sibling(enhanced_img, 2);
	var span_2 = $.child(span_1);
	var text = $.only_child(span_2, true);
	var span_3 = $.sibling(span_2, 2);
	var text_1 = $.only_child(span_3, true);

	$.reset(span_1);
	$.reset(span);

	$.template_effect(() => {
		$.set_attribute(enhanced_img, 'src', item().avatar);
		$.set_attribute(enhanced_img, 'alt', item().name);
		$.set_text(text, item().name);
		$.set_text(text_1, item().username);
	});

	$.append($$anchor, span);
};

var root = $.from_html(`<span class="flex items-center gap-2"><enhanced:img class=" size-10 rounded-full"></enhanced:img> <span><span class="block font-medium"> </span> <span class="text-muted-foreground mt-0.5 block text-xs"> </span></span></span>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="space-y-2"><!> <!></div>`);

export default function Select_40($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	const items = [
		{
			avatar: Avatar01,
			name: 'Jenny Hamilton',
			username: '@jennycodes',
			value: 's1'
		},

		{
			avatar: Avatar02,
			name: 'Paul Smith',
			username: '@paulsmith',
			value: 's2'
		},

		{
			avatar: Avatar03,
			name: 'Luna Wyen',
			username: '@wyen.luna',
			value: 's3'
		}
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

			var text_2 = $.text('Options with portrait');

			$.append($$anchor, text_2);
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

				{
					let $0 = $.derived(() => cn('h-auto [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_img]:shrink-0', $.get(selected) && 'ps-2'));

					$.component(node_2, () => Select.Trigger, ($$anchor, Select_Trigger) => {
						Select_Trigger($$anchor, {
							get id() {
								return uid;
							},

							get class() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_1 = $.comment();
								var node_3 = $.first_child(fragment_1);

								{
									var consequent = ($$anchor) => {
										user($$anchor, () => $.get(selected));
									};

									var alternate = ($$anchor) => {
										var text_3 = $.text('Select a user');

										$.append($$anchor, text_3);
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
				}

				var node_4 = $.sibling(node_2, 2);

				$.component(node_4, () => Select.Content, ($$anchor, Select_Content) => {
					Select_Content($$anchor, {
						class: '[&_*[data-select-item]]:ps-2 [&_*[data-select-item]]:pe-8 [&_*[data-select-item]>span]:start-auto [&_*[data-select-item]>span]:end-2',
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
											user($$anchor, () => $.get(item));
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
	$.pop();
}
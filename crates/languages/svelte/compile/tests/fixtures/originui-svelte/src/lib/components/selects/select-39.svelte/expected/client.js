import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '$lib/components/ui/label.svelte';
import * as Select from '$lib/components/ui/select/index.js';
import { cn } from '$lib/utils.js';

const user = ($$anchor, item = $.noop) => {
	var fragment = root();
	var span = $.first_child(fragment);
	var text = $.only_child(span, true);
	var span_1 = $.sibling(span, 2);
	var text_1 = $.only_child(span_1, true);

	$.template_effect(
		($0, $1) => {
			$.set_class(span, 1, $0);
			$.set_text(text, $1);
			$.set_text(text_1, item().name);
		},
		[
			() => $.clsx(cn('bg-muted text-muted-foreground flex size-5 items-center justify-center rounded text-xs font-medium', item().class)),
			() => item().name.charAt(0)
		]
	);

	$.append($$anchor, fragment);
};

var root = $.from_html(`<span data-square="" aria-hidden="true"> </span> <span class="truncate"> </span>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="space-y-2"><!> <!></div>`);

export default function Select_39($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	const items = [
		{
			class: 'bg-indigo-400/20 text-indigo-500',
			name: 'Frank Morris',
			value: 's1'
		},

		{
			class: 'bg-purple-400/20 text-purple-500',
			name: 'Xavier Guerra',
			value: 's2'
		},

		{
			class: 'bg-rose-400/20 text-rose-500',
			name: 'Anne Kelley',
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

			var text_2 = $.text('Options with placeholder avatar');

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
				var fragment_1 = root_1();
				var node_2 = $.first_child(fragment_1);

				{
					let $0 = $.derived(() => cn('[&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_img]:shrink-0', $.get(selected) && 'ps-2'));

					$.component(node_2, () => Select.Trigger, ($$anchor, Select_Trigger) => {
						Select_Trigger($$anchor, {
							get id() {
								return uid;
							},

							get class() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_2 = $.comment();
								var node_3 = $.first_child(fragment_2);

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

								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						});
					});
				}

				var node_4 = $.sibling(node_2, 2);

				$.component(node_4, () => Select.Content, ($$anchor, Select_Content) => {
					Select_Content($$anchor, {
						class: '[&_*[data-select-item]]:ps-2 [&_*[data-select-item]]:pe-8 [&_*[data-select-item]>span]:start-auto [&_*[data-select-item]>span]:end-2 [&_*[data-select-item]>span]:flex [&_*[data-select-item]>span]:items-center [&_*[data-select-item]>span]:gap-2',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = $.comment();
							var node_5 = $.first_child(fragment_4);

							$.component(node_5, () => Select.Group, ($$anchor, Select_Group) => {
								Select_Group($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = root_1();
										var node_6 = $.first_child(fragment_5);

										$.component(node_6, () => Select.GroupHeading, ($$anchor, Select_GroupHeading) => {
											Select_GroupHeading($$anchor, {
												class: 'ps-2',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_4 = $.text('Impersonate user');

													$.append($$anchor, text_4);
												},
												$$slots: { default: true }
											});
										});

										var node_7 = $.sibling(node_6, 2);

										$.each(node_7, 17, () => items, (item) => item.value, ($$anchor, item) => {
											var fragment_6 = $.comment();
											var node_8 = $.first_child(fragment_6);

											$.component(node_8, () => Select.Item, ($$anchor, Select_Item) => {
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

											$.append($$anchor, fragment_6);
										});

										$.append($$anchor, fragment_5);
									},
									$$slots: { default: true }
								});
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
	$.pop();
}
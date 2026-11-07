import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '$lib/components/ui/label.svelte';
import * as Select from '$lib/components/ui/select/index.js';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="space-y-2"><!> <!></div>`);

export default function Select_25($$anchor) {
	const uid = $.props_id();

	const frontend = [
		{ label: 'Svelte', value: 's1' },
		{ label: 'Vue', value: 's2' },
		{ label: 'Angular', value: 's3' }
	];

	const backend = [
		{ label: 'Node.js', value: 's4' },
		{ label: 'Python', value: 's5' },
		{ label: 'Java', value: 's6' }
	];

	const items = [...frontend, ...backend];
	let value = $.state('s1');
	const selected = $.derived(() => items.find((i) => i.value === $.get(value)));
	var div = root_1();
	var node = $.child(div);

	Label(node, {
		get for() {
			return uid;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Select with options groups');

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
							var fragment_2 = root();
							var node_4 = $.first_child(fragment_2);

							$.component(node_4, () => Select.Group, ($$anchor, Select_Group) => {
								Select_Group($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_5 = $.first_child(fragment_3);

										$.component(node_5, () => Select.GroupHeading, ($$anchor, Select_GroupHeading) => {
											Select_GroupHeading($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('Frontend');

													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});
										});

										var node_6 = $.sibling(node_5, 2);

										$.each(node_6, 17, () => frontend, (item) => item.value, ($$anchor, item) => {
											var fragment_4 = $.comment();
											var node_7 = $.first_child(fragment_4);

											$.component(node_7, () => Select.Item, ($$anchor, Select_Item) => {
												Select_Item($$anchor, {
													get value() {
														return $.get(item).value;
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_3 = $.text();

														$.template_effect(() => $.set_text(text_3, $.get(item).label));
														$.append($$anchor, text_3);
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

							var node_8 = $.sibling(node_4, 2);

							$.component(node_8, () => Select.Group, ($$anchor, Select_Group_1) => {
								Select_Group_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_6 = root();
										var node_9 = $.first_child(fragment_6);

										$.component(node_9, () => Select.GroupHeading, ($$anchor, Select_GroupHeading_1) => {
											Select_GroupHeading_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_4 = $.text('Backend');

													$.append($$anchor, text_4);
												},
												$$slots: { default: true }
											});
										});

										var node_10 = $.sibling(node_9, 2);

										$.each(node_10, 17, () => backend, (item) => item.value, ($$anchor, item) => {
											var fragment_7 = $.comment();
											var node_11 = $.first_child(fragment_7);

											$.component(node_11, () => Select.Item, ($$anchor, Select_Item_1) => {
												Select_Item_1($$anchor, {
													get value() {
														return $.get(item).value;
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_5 = $.text();

														$.template_effect(() => $.set_text(text_5, $.get(item).label));
														$.append($$anchor, text_5);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_7);
										});

										$.append($$anchor, fragment_6);
									},
									$$slots: { default: true }
								});
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
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '$lib/components/ui/label.svelte';
import * as Select from '$lib/components/ui/select/index.js';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="space-y-2"><!> <!></div>`);

export default function Select_33($$anchor) {
	const uid = $.props_id();

	const items = [
		{ label: 'Javascript', value: 's1' },
		{ label: 'Bash', value: 's2' }
	];

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

			var text = $.text('Select with left text');

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
							var fragment_1 = $.comment();
							var node_3 = $.first_child(fragment_1);

							{
								var consequent = ($$anchor) => {
									var text_1 = $.text();

									$.template_effect(() => $.set_text(text_1, `Language: ${$.get(selected).label ?? ''}`));
									$.append($$anchor, text_1);
								};

								var alternate = ($$anchor) => {
									var text_2 = $.text('Select a language');

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

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}
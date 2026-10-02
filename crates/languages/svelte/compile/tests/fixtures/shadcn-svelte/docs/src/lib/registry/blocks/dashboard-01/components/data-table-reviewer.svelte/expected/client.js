import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Select from "$lib/registry/ui/select/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

var root = $.from_html(`<span data-slot="select-value"> </span>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Data_table_reviewer($$anchor, $$props) {
	$.push($$props, true);

	const isAssigned = $.derived(() => $$props.row.original.reviewer !== "Assign reviewer");
	let reviewer = $.state("");
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var text = $.text();

			$.template_effect(() => $.set_text(text, $$props.row.original.reviewer));
			$.append($$anchor, text);
		};

		var alternate = ($$anchor) => {
			var fragment_2 = root_1();
			var node_1 = $.first_child(fragment_2);

			Label(node_1, {
				get for() {
					return `${$$props.row.original.id ?? ''}-reviewer`;
				},
				class: 'sr-only',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Reviewer');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			$.component(node_2, () => Select.Root, ($$anchor, Select_Root) => {
				Select_Root($$anchor, {
					type: 'single',
					get value() {
						return $.get(reviewer);
					},

					set value($$value) {
						$.set(reviewer, $$value, true);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root_1();
						var node_3 = $.first_child(fragment_3);

						$.component(node_3, () => Select.Trigger, ($$anchor, Select_Trigger) => {
							Select_Trigger($$anchor, {
								class: 'w-38 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate',
								size: 'sm',
								get id() {
									return `${$$props.row.original.id ?? ''}-reviewer`;
								},

								children: ($$anchor, $$slotProps) => {
									var span = root();
									var text_2 = $.only_child(span, true);

									$.template_effect(() => $.set_text(text_2, $.get(reviewer) !== "" ? $.get(reviewer) : "Assign reviewer"));
									$.append($$anchor, span);
								},
								$$slots: { default: true }
							});
						});

						var node_4 = $.sibling(node_3, 2);

						$.component(node_4, () => Select.Content, ($$anchor, Select_Content) => {
							Select_Content($$anchor, {
								align: 'end',
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root_1();
									var node_5 = $.first_child(fragment_4);

									$.component(node_5, () => Select.Item, ($$anchor, Select_Item) => {
										Select_Item($$anchor, {
											value: 'Eddie Lake',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_3 = $.text('Eddie Lake');

												$.append($$anchor, text_3);
											},
											$$slots: { default: true }
										});
									});

									var node_6 = $.sibling(node_5, 2);

									$.component(node_6, () => Select.Item, ($$anchor, Select_Item_1) => {
										Select_Item_1($$anchor, {
											value: 'Jamik Tashpulatov',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_4 = $.text('Jamik Tashpulatov');

												$.append($$anchor, text_4);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_2);
		};

		$.if(node, ($$render) => {
			if ($.get(isAssigned)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}
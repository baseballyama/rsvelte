import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Field from "$lib/registry/ui/field/index.js";
import * as Select from "$lib/registry/ui/select/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="w-full max-w-md"><!></div>`);

export default function Field_select_demo($$anchor, $$props) {
	$.push($$props, true);

	let department = $.state(void 0);

	const departments = [
		{ value: "engineering", label: "Engineering" },
		{ value: "design", label: "Design" },
		{ value: "marketing", label: "Marketing" },
		{ value: "sales", label: "Sales" },
		{ value: "support", label: "Customer Support" },
		{ value: "hr", label: "Human Resources" },
		{ value: "finance", label: "Finance" },
		{ value: "operations", label: "Operations" }
	];

	const departmentLabel = $.derived(() => departments.find((d) => d.value === $.get(department))?.label ?? "Choose department");
	var div = root_2();
	var node = $.child(div);

	$.component(node, () => Field.Field, ($$anchor, Field_Field) => {
		Field_Field($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = root_1();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Field.Label, ($$anchor, Field_Label) => {
					Field_Label($$anchor, {
						for: 'department',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Department');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Select.Root, ($$anchor, Select_Root) => {
					Select_Root($$anchor, {
						type: 'single',
						get value() {
							return $.get(department);
						},

						set value($$value) {
							$.set(department, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root();
							var node_3 = $.first_child(fragment_1);

							$.component(node_3, () => Select.Trigger, ($$anchor, Select_Trigger) => {
								Select_Trigger($$anchor, {
									id: 'department',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text();

										$.template_effect(() => $.set_text(text_1, $.get(departmentLabel)));
										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => Select.Content, ($$anchor, Select_Content) => {
								Select_Content($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_5 = $.first_child(fragment_3);

										$.each(node_5, 17, () => departments, (department) => department.value, ($$anchor, department, $$index, $$array) => {
											var fragment_4 = $.comment();
											var node_6 = $.first_child(fragment_4);

											$.component(node_6, () => Select.Item, ($$anchor, Select_Item) => {
												Select_Item($$anchor, $.spread_props(() => $.get(department)));
											});

											$.append($$anchor, fragment_4);
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				var node_7 = $.sibling(node_2, 2);

				$.component(node_7, () => Field.Description, ($$anchor, Field_Description) => {
					Field_Description($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Select your department or area of work.');

							$.append($$anchor, text_2);
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
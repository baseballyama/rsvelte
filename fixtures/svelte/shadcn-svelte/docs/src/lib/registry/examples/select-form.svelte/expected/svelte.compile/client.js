import 'svelte/internal/disclose-version';
import { z } from "zod";
import * as $ from 'svelte/internal/client';
import { toast } from "svelte-sonner";
import { defaults, superForm } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import * as Form from "$lib/registry/ui/form/index.js";
import * as Select from "$lib/registry/ui/select/index.js";

const formSchema = z.object({
	email: z.email({ message: "Please select an email to display" })
});

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`You can manage email address in your <a href="/examples/forms">email settings</a>.`, 1);
var root_3 = $.from_html(`<form method="POST" class="w-2/3 space-y-6"><!> <!></form>`);

export default function Select_form($$anchor, $$props) {
	$.push($$props, true);

	const $formData = () => $.store_get(formData, '$formData', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	const form = superForm(defaults(zod4(formSchema)), {
		validators: zod4(formSchema),
		SPA: true,
		onUpdate: ({ form: f }) => {
			if (f.valid) {
				toast.success(`You submitted ${JSON.stringify(f.data, null, 2)}`);
			} else {
				toast.error("Please fix the errors in the form.");
			}
		}
	});

	const { form: formData, enhance } = form;
	var form_1 = root_3();
	var node = $.child(form_1);

	$.component(node, () => Form.Field, ($$anchor, Form_Field) => {
		Form_Field($$anchor, {
			get form() {
				return form;
			},
			name: 'email',
			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				{
					const children = ($$anchor, $$arg0) => {
						let props = () => ($$arg0?.()).props;
						var fragment_1 = root_1();
						var node_2 = $.first_child(fragment_1);

						$.component(node_2, () => Form.Label, ($$anchor, Form_Label) => {
							Form_Label($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Email');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => Select.Root, ($$anchor, Select_Root) => {
							Select_Root($$anchor, {
								type: 'single',
								get name() {
									return props().name;
								},

								get value() {
									return $formData().email;
								},

								set value($$value) {
									$.store_mutate(formData, $.untrack($formData).email = $$value, $.untrack($formData));
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_2 = root_1();
									var node_4 = $.first_child(fragment_2);

									$.component(node_4, () => Select.Trigger, ($$anchor, Select_Trigger) => {
										Select_Trigger($$anchor, $.spread_props(props, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text();

												$.template_effect(() => $.set_text(text_1, $formData().email
													? $formData().email
													: "Select a verified email to display"));

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										}));
									});

									var node_5 = $.sibling(node_4, 2);

									$.component(node_5, () => Select.Content, ($$anchor, Select_Content) => {
										Select_Content($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root();
												var node_6 = $.first_child(fragment_4);

												$.component(node_6, () => Select.Item, ($$anchor, Select_Item) => {
													Select_Item($$anchor, { value: 'm@example.com', label: 'm@example.com' });
												});

												var node_7 = $.sibling(node_6, 2);

												$.component(node_7, () => Select.Item, ($$anchor, Select_Item_1) => {
													Select_Item_1($$anchor, { value: 'm@google.com', label: 'm@google.com' });
												});

												var node_8 = $.sibling(node_7, 2);

												$.component(node_8, () => Select.Item, ($$anchor, Select_Item_2) => {
													Select_Item_2($$anchor, { value: 'm@support.com', label: 'm@support.com' });
												});

												$.append($$anchor, fragment_4);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_2);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_1);
					};

					$.component(node_1, () => Form.Control, ($$anchor, Form_Control) => {
						Form_Control($$anchor, { children, $$slots: { default: true } });
					});
				}

				var node_9 = $.sibling(node_1, 2);

				$.component(node_9, () => Form.Description, ($$anchor, Form_Description) => {
					Form_Description($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_5 = root_2();

							$.next(2);
							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});
				});

				var node_10 = $.sibling(node_9, 2);

				$.component(node_10, () => Form.FieldErrors, ($$anchor, Form_FieldErrors) => {
					Form_FieldErrors($$anchor, {});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	var node_11 = $.sibling(node, 2);

	$.component(node_11, () => Form.Button, ($$anchor, Form_Button) => {
		Form_Button($$anchor, {
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_2 = $.text('Submit');

				$.append($$anchor, text_2);
			},
			$$slots: { default: true }
		});
	});

	$.reset(form_1);
	$.action(form_1, ($$node) => enhance?.($$node));
	$.append($$anchor, form_1);
	$.pop();
	$$cleanup();
}
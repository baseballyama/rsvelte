import 'svelte/internal/disclose-version';
import { z } from "zod";
import * as $ from 'svelte/internal/client';
import { toast } from "svelte-sonner";
import { defaults, superForm } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import * as Form from "$lib/registry/ui/form/index.js";
import { Switch } from "$lib/registry/ui/switch/index.js";

const formSchema = z.object({
	marketing_emails: z.boolean().default(false),
	security_emails: z.boolean().default(true)
});

var root = $.from_html(`<div class="space-y-0.5"><!> <!></div> <!>`, 1);
var root_1 = $.from_html(`<form method="POST" class="w-full space-y-6"><fieldset><legend class="mb-4 text-lg font-medium">Email Notifications</legend> <div class="space-y-4"><!> <!></div></fieldset> <!></form>`);

export default function Switch_form($$anchor, $$props) {
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
	var form_1 = root_1();
	var fieldset = $.child(form_1);
	var div = $.sibling($.child(fieldset), 2);
	var node = $.child(div);

	$.component(node, () => Form.Field, ($$anchor, Form_Field) => {
		Form_Field($$anchor, {
			get form() {
				return form;
			},
			name: 'marketing_emails',
			class: 'flex flex-row items-center justify-between rounded-lg border p-4',
			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				{
					const children = ($$anchor, $$arg0) => {
						let props = () => ($$arg0?.()).props;
						var fragment_1 = root();
						var div_1 = $.first_child(fragment_1);
						var node_2 = $.child(div_1);

						$.component(node_2, () => Form.Label, ($$anchor, Form_Label) => {
							Form_Label($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Marketing emails');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => Form.Description, ($$anchor, Form_Description) => {
							Form_Description($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Receive emails about new products, features, and more.');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
						});

						$.reset(div_1);

						var node_4 = $.sibling(div_1, 2);

						Switch(node_4, $.spread_props(props, {
							get checked() {
								return $formData().marketing_emails;
							},

							set checked($$value) {
								$.store_mutate(formData, $.untrack($formData).marketing_emails = $$value, $.untrack($formData));
							}
						}));

						$.append($$anchor, fragment_1);
					};

					$.component(node_1, () => Form.Control, ($$anchor, Form_Control) => {
						Form_Control($$anchor, { children, $$slots: { default: true } });
					});
				}

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	var node_5 = $.sibling(node, 2);

	$.component(node_5, () => Form.Field, ($$anchor, Form_Field_1) => {
		Form_Field_1($$anchor, {
			get form() {
				return form;
			},
			name: 'security_emails',
			class: 'flex flex-row items-center justify-between rounded-lg border p-4',
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = $.comment();
				var node_6 = $.first_child(fragment_2);

				{
					const children = ($$anchor, $$arg0) => {
						let props = () => ($$arg0?.()).props;
						var fragment_3 = root();
						var div_2 = $.first_child(fragment_3);
						var node_7 = $.child(div_2);

						$.component(node_7, () => Form.Label, ($$anchor, Form_Label_1) => {
							Form_Label_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Security emails');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});
						});

						var node_8 = $.sibling(node_7, 2);

						$.component(node_8, () => Form.Description, ($$anchor, Form_Description_1) => {
							Form_Description_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Receive emails about your account security.');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});
						});

						$.reset(div_2);

						var node_9 = $.sibling(div_2, 2);

						Switch(node_9, $.spread_props(props, {
							'aria-readonly': true,
							disabled: true,
							get checked() {
								return $formData().security_emails;
							},

							set checked($$value) {
								$.store_mutate(formData, $.untrack($formData).security_emails = $$value, $.untrack($formData));
							}
						}));

						$.append($$anchor, fragment_3);
					};

					$.component(node_6, () => Form.Control, ($$anchor, Form_Control_1) => {
						Form_Control_1($$anchor, { children, $$slots: { default: true } });
					});
				}

				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.reset(fieldset);

	var node_10 = $.sibling(fieldset, 2);

	$.component(node_10, () => Form.Button, ($$anchor, Form_Button) => {
		Form_Button($$anchor, {
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_4 = $.text('Submit');

				$.append($$anchor, text_4);
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
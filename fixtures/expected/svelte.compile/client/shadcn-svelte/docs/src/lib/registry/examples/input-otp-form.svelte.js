import 'svelte/internal/disclose-version';
import { z } from "zod";
import * as $ from 'svelte/internal/client';
import { toast } from "svelte-sonner";
import { defaults, superForm } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import * as Form from "$lib/registry/ui/form/index.js";
import * as InputOTP from "$lib/registry/ui/input-otp/index.js";

const formSchema = z.object({
	pin: z.string().min(6, {
		message: "Your one-time password must be at least 6 characters."
	})
});

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<form method="POST" class="w-2/3 space-y-6"><!> <!></form>`);

export default function Input_otp_form($$anchor, $$props) {
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
	var form_1 = root_2();
	var node = $.child(form_1);

	$.component(node, () => Form.Field, ($$anchor, Form_Field) => {
		Form_Field($$anchor, {
			get form() {
				return form;
			},
			name: 'pin',
			children: ($$anchor, $$slotProps) => {
				var fragment = root_1();
				var node_1 = $.first_child(fragment);

				{
					const children = ($$anchor, $$arg0) => {
						let props = () => ($$arg0?.()).props;
						var fragment_1 = root();
						var node_2 = $.first_child(fragment_1);

						$.component(node_2, () => Form.Label, ($$anchor, Form_Label) => {
							Form_Label($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('One-Time Password');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						var node_3 = $.sibling(node_2, 2);

						{
							const children = ($$anchor, $$arg0) => {
								let cells = () => ($$arg0?.()).cells;
								var fragment_2 = $.comment();
								var node_4 = $.first_child(fragment_2);

								$.component(node_4, () => InputOTP.Group, ($$anchor, InputOTP_Group) => {
									InputOTP_Group($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_3 = $.comment();
											var node_5 = $.first_child(fragment_3);

											$.each(node_5, 16, cells, (cell) => cell, ($$anchor, cell) => {
												var fragment_4 = $.comment();
												var node_6 = $.first_child(fragment_4);

												$.component(node_6, () => InputOTP.Slot, ($$anchor, InputOTP_Slot) => {
													InputOTP_Slot($$anchor, {
														get cell() {
															return cell;
														}
													});
												});

												$.append($$anchor, fragment_4);
											});

											$.append($$anchor, fragment_3);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_2);
							};

							$.component(node_3, () => InputOTP.Root, ($$anchor, InputOTP_Root) => {
								InputOTP_Root($$anchor, $.spread_props({ maxlength: 6 }, props, {
									get value() {
										return $formData().pin;
									},

									set value($$value) {
										$.store_mutate(formData, $.untrack($formData).pin = $$value, $.untrack($formData));
									},
									children,
									$$slots: { default: true }
								}));
							});
						}

						$.append($$anchor, fragment_1);
					};

					$.component(node_1, () => Form.Control, ($$anchor, Form_Control) => {
						Form_Control($$anchor, { children, $$slots: { default: true } });
					});
				}

				var node_7 = $.sibling(node_1, 2);

				$.component(node_7, () => Form.Description, ($$anchor, Form_Description) => {
					Form_Description($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Please enter the one-time password sent to your phone.');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				});

				var node_8 = $.sibling(node_7, 2);

				$.component(node_8, () => Form.FieldErrors, ($$anchor, Form_FieldErrors) => {
					Form_FieldErrors($$anchor, {});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	var node_9 = $.sibling(node, 2);

	$.component(node_9, () => Form.Button, ($$anchor, Form_Button) => {
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
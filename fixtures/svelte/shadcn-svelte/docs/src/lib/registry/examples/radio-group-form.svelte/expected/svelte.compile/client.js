import 'svelte/internal/disclose-version';
import { z } from "zod";
import * as $ from 'svelte/internal/client';
import { toast } from "svelte-sonner";
import { defaults, superForm } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import * as Form from "$lib/registry/ui/form/index.js";
import * as RadioGroup from "$lib/registry/ui/radio-group/index.js";

const formSchema = z.object({ type: z.enum(["all", "mentions", "none"]) });
var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex items-center space-y-0 space-x-3"><!></div> <div class="flex items-center space-y-0 space-x-3"><!></div> <div class="flex items-center space-y-0 space-x-3"><!></div>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<form method="POST" class="w-2/3 space-y-6"><!> <!></form>`);

export default function Radio_group_form($$anchor, $$props) {
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

	$.component(node, () => Form.Fieldset, ($$anchor, Form_Fieldset) => {
		Form_Fieldset($$anchor, {
			get form() {
				return form;
			},
			name: 'type',
			class: 'space-y-3',
			children: ($$anchor, $$slotProps) => {
				var fragment = root_2();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Form.Legend, ($$anchor, Form_Legend) => {
					Form_Legend($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Notify me about...');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => RadioGroup.Root, ($$anchor, RadioGroup_Root) => {
					RadioGroup_Root($$anchor, {
						class: 'flex flex-col space-y-1',
						name: 'type',
						get value() {
							return $formData().type;
						},

						set value($$value) {
							$.store_mutate(formData, $.untrack($formData).type = $$value, $.untrack($formData));
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root_1();
							var div = $.first_child(fragment_1);
							var node_3 = $.child(div);

							{
								const children = ($$anchor, $$arg0) => {
									let props = () => ($$arg0?.()).props;
									var fragment_2 = root();
									var node_4 = $.first_child(fragment_2);

									$.component(node_4, () => RadioGroup.Item, ($$anchor, RadioGroup_Item) => {
										RadioGroup_Item($$anchor, $.spread_props({ value: 'all' }, props));
									});

									var node_5 = $.sibling(node_4, 2);

									$.component(node_5, () => Form.Label, ($$anchor, Form_Label) => {
										Form_Label($$anchor, {
											class: 'font-normal',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('All new messages');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_2);
								};

								$.component(node_3, () => Form.Control, ($$anchor, Form_Control) => {
									Form_Control($$anchor, { children, $$slots: { default: true } });
								});
							}

							$.reset(div);

							var div_1 = $.sibling(div, 2);
							var node_6 = $.child(div_1);

							{
								const children = ($$anchor, $$arg0) => {
									let props = () => ($$arg0?.()).props;
									var fragment_3 = root();
									var node_7 = $.first_child(fragment_3);

									$.component(node_7, () => RadioGroup.Item, ($$anchor, RadioGroup_Item_1) => {
										RadioGroup_Item_1($$anchor, $.spread_props({ value: 'mentions' }, props));
									});

									var node_8 = $.sibling(node_7, 2);

									$.component(node_8, () => Form.Label, ($$anchor, Form_Label_1) => {
										Form_Label_1($$anchor, {
											class: 'font-normal',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text('Direction messages and mentions');

												$.append($$anchor, text_2);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_3);
								};

								$.component(node_6, () => Form.Control, ($$anchor, Form_Control_1) => {
									Form_Control_1($$anchor, { children, $$slots: { default: true } });
								});
							}

							$.reset(div_1);

							var div_2 = $.sibling(div_1, 2);
							var node_9 = $.child(div_2);

							{
								const children = ($$anchor, $$arg0) => {
									let props = () => ($$arg0?.()).props;
									var fragment_4 = root();
									var node_10 = $.first_child(fragment_4);

									$.component(node_10, () => RadioGroup.Item, ($$anchor, RadioGroup_Item_2) => {
										RadioGroup_Item_2($$anchor, $.spread_props({ value: 'none' }, props));
									});

									var node_11 = $.sibling(node_10, 2);

									$.component(node_11, () => Form.Label, ($$anchor, Form_Label_2) => {
										Form_Label_2($$anchor, {
											class: 'font-normal',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_3 = $.text('Nothing');

												$.append($$anchor, text_3);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_4);
								};

								$.component(node_9, () => Form.Control, ($$anchor, Form_Control_2) => {
									Form_Control_2($$anchor, { children, $$slots: { default: true } });
								});
							}

							$.reset(div_2);
							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				var node_12 = $.sibling(node_2, 2);

				$.component(node_12, () => Form.FieldErrors, ($$anchor, Form_FieldErrors) => {
					Form_FieldErrors($$anchor, {});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	var node_13 = $.sibling(node, 2);

	$.component(node_13, () => Form.Button, ($$anchor, Form_Button) => {
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
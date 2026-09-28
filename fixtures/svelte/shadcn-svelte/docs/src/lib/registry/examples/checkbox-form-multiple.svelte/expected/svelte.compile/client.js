import 'svelte/internal/disclose-version';
import { z } from "zod";
import * as $ from 'svelte/internal/client';
import { toast } from "svelte-sonner";
import { defaults, superForm } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import * as Form from "$lib/registry/ui/form/index.js";
import { Checkbox } from "$lib/registry/ui/checkbox/index.js";

const items = [
	{ id: "recents", label: "Recents" },
	{ id: "home", label: "Home" },
	{ id: "applications", label: "Applications" },
	{ id: "desktop", label: "Desktop" },
	{ id: "downloads", label: "Downloads" },
	{ id: "documents", label: "Documents" }
];

const formSchema = z.object({
	items: z.array(z.string()).refine((value) => value.some((item) => item), { message: "You have to select at least one item." })
});

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex flex-row items-start space-x-3"><!></div>`);
var root_2 = $.from_html(`<div class="mb-4"><!> <!></div> <div class="space-y-2"><!> <!></div>`, 1);
var root_3 = $.from_html(`<form method="POST" class="space-y-8"><!> <!></form>`);

export default function Checkbox_form_multiple($$anchor, $$props) {
	$.push($$props, true);

	const $formData = () => $.store_get(formData, '$formData', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	const form = superForm(defaults(zod4(formSchema)), {
		SPA: true,
		validators: zod4(formSchema),
		onUpdate: ({ form: f }) => {
			if (f.valid) {
				toast.success(`You submitted ${JSON.stringify(f.data, null, 2)}`);
			} else {
				toast.error("Please fix the errors in the form.");
			}
		}
	});

	const { form: formData, enhance } = form;

	function addItem(id) {
		$.store_mutate(formData, $.untrack($formData).items = [...$formData().items, id], $.untrack($formData));
	}

	function removeItem(id) {
		$.store_mutate(formData, $.untrack($formData).items = $formData().items.filter((i) => i !== id), $.untrack($formData));
	}

	var form_1 = root_3();
	var node = $.child(form_1);

	$.component(node, () => Form.Fieldset, ($$anchor, Form_Fieldset) => {
		Form_Fieldset($$anchor, {
			get form() {
				return form;
			},
			name: 'items',
			class: 'space-y-0',
			children: ($$anchor, $$slotProps) => {
				var fragment = root_2();
				var div = $.first_child(fragment);
				var node_1 = $.child(div);

				$.component(node_1, () => Form.Legend, ($$anchor, Form_Legend) => {
					Form_Legend($$anchor, {
						class: 'text-base',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Sidebar');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Form.Description, ($$anchor, Form_Description) => {
					Form_Description($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Select the items you want to display in the sidebar.');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div);

				var div_1 = $.sibling(div, 2);
				var node_3 = $.child(div_1);

				$.each(node_3, 17, () => items, (item) => item.id, ($$anchor, item) => {
					const checked = $.derived(() => $formData().items.includes($.get(item).id));
					var div_2 = root_1();
					var node_4 = $.child(div_2);

					{
						const children = ($$anchor, $$arg0) => {
							let props = () => ($$arg0?.()).props;
							var fragment_1 = root();
							var node_5 = $.first_child(fragment_1);

							Checkbox(node_5, $.spread_props(props, {
								get checked() {
									return $.get(checked);
								},

								get value() {
									return $.get(item).id;
								},

								onCheckedChange: (v) => {
									if (v) {
										addItem($.get(item).id);
									} else {
										removeItem($.get(item).id);
									}
								}
							}));

							var node_6 = $.sibling(node_5, 2);

							$.component(node_6, () => Form.Label, ($$anchor, Form_Label) => {
								Form_Label($$anchor, {
									class: 'font-normal',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text();

										$.template_effect(() => $.set_text(text_2, $.get(item).label));
										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_1);
						};

						$.component(node_4, () => Form.Control, ($$anchor, Form_Control) => {
							Form_Control($$anchor, { children, $$slots: { default: true } });
						});
					}

					$.reset(div_2);
					$.append($$anchor, div_2);
				});

				var node_7 = $.sibling(node_3, 2);

				$.component(node_7, () => Form.FieldErrors, ($$anchor, Form_FieldErrors) => {
					Form_FieldErrors($$anchor, {});
				});

				$.reset(div_1);
				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	var node_8 = $.sibling(node, 2);

	$.component(node_8, () => Form.Button, ($$anchor, Form_Button) => {
		Form_Button($$anchor, {
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_3 = $.text('Update display');

				$.append($$anchor, text_3);
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
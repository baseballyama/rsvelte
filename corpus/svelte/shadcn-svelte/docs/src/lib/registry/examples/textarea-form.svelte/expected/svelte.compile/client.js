import 'svelte/internal/disclose-version';
import { z } from "zod";
import * as $ from 'svelte/internal/client';
import { toast } from "svelte-sonner";
import { defaults, superForm } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import * as Form from "$lib/registry/ui/form/index.js";
import { Textarea } from "$lib/registry/ui/textarea/index.js";

const formSchema = z.object({
	bio: z.string().min(10, "Bio must be at least 10 characters.").max(160, "Bio must be at most 160 characters.")
});

var root = $.from_html(`You can <span>@mention</span> other users and organizations.`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<form method="POST" class="w-2/3 space-y-6"><!> <!></form>`);

export default function Textarea_form($$anchor, $$props) {
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
			name: 'bio',
			children: ($$anchor, $$slotProps) => {
				var fragment = root_2();
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

									var text = $.text('Bio');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						var node_3 = $.sibling(node_2, 2);

						Textarea(node_3, $.spread_props(props, {
							placeholder: 'Tell us a little bit about yourself',
							class: 'resize-none',
							get value() {
								return $formData().bio;
							},

							set value($$value) {
								$.store_mutate(formData, $.untrack($formData).bio = $$value, $.untrack($formData));
							}
						}));

						var node_4 = $.sibling(node_3, 2);

						$.component(node_4, () => Form.Description, ($$anchor, Form_Description) => {
							Form_Description($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var fragment_2 = root();

									$.next(2);
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

				var node_5 = $.sibling(node_1, 2);

				$.component(node_5, () => Form.FieldErrors, ($$anchor, Form_FieldErrors) => {
					Form_FieldErrors($$anchor, {});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	var node_6 = $.sibling(node, 2);

	$.component(node_6, () => Form.Button, ($$anchor, Form_Button) => {
		Form_Button($$anchor, {
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_1 = $.text('Submit');

				$.append($$anchor, text_1);
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
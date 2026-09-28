import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Label } from "$lib/registry/ui/label/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Textarea } from "$lib/registry/ui/textarea/index.js";
import { z } from "zod";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`Name <span aria-hidden="true">*</span>`, 1);
var root_2 = $.from_html(`<p id="error-name" class="text-destructive text-sm"> </p>`);
var root_3 = $.from_html(`Email <span aria-hidden="true">*</span>`, 1);
var root_4 = $.from_html(`<p id="error-email" class="text-destructive text-sm"> </p>`);
var root_5 = $.from_html(`Message <span aria-hidden="true">*</span>`, 1);
var root_6 = $.from_html(`<p id="error-message" class="text-destructive text-sm"> </p>`);
var root_7 = $.from_html(`<div class="group/field grid gap-2"><!> <!> <!></div> <div class="group/field grid gap-2"><!> <!> <!></div> <div class="group/field grid gap-2"><!> <!> <!></div>`, 1);
var root_8 = $.from_html(`<!> <!> <!>`, 1);
var root_9 = $.from_html(`<form class="w-full max-w-sm"><!></form>`);

export default function Example_form($$anchor, $$props) {
	$.push($$props, true);

	const exampleFormSchema = z.object({
		name: z.string().min(1),
		email: z.string().email(),
		message: z.string().min(1)
	});

	let pending = $.state(false);

	let formState = $.state($.proxy({
		defaultValues: { name: "", email: "", message: "" },
		success: false,
		errors: { name: "", email: "", message: "" }
	}));

	const handleSubmit = (e) => {
		e.preventDefault();
		$.set(pending, true);

		const formData = new FormData(e.currentTarget);
		const data = Object.fromEntries(formData);
		const result = exampleFormSchema.safeParse(data);

		if (!result.success) {
			$.set(
				formState,
				{
					...$.get(formState),
					errors: Object.fromEntries(Object.entries(result.error.flatten().fieldErrors).map(([key, value]) => [key, value?.[0] ?? ""]))
				},
				true
			);

			$.set(pending, false);

			return;
		}

		$.set(pending, false);
	};

	var form = root_9();
	var node = $.child(form);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = root_8();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root();
							var node_2 = $.first_child(fragment_1);

							$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('How can we help?');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Card.Description, ($$anchor, Card_Description) => {
								Card_Description($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Need help with your project? We\'re here to assist you.');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				var node_4 = $.sibling(node_1, 2);

				$.component(node_4, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						class: 'flex flex-col gap-6',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_7();
							var div = $.first_child(fragment_2);
							var node_5 = $.child(div);

							Label(node_5, {
								for: 'name',
								class: 'group-data-[invalid=true]/field:text-destructive',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var fragment_3 = root_1();

									$.next();
									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});

							var node_6 = $.sibling(node_5, 2);

							{
								let $0 = $.derived(() => !!$.get(formState).errors?.name);

								Input(node_6, {
									id: 'name',
									name: 'name',
									placeholder: 'Lee Robinson',
									class: 'group-data-[invalid=true]/field:border-destructive focus-visible:group-data-[invalid=true]/field:ring-destructive',
									get disabled() {
										return $.get(pending);
									},

									get 'aria-invalid'() {
										return $.get($0);
									},
									'aria-errormessage': 'error-name',
									get defaultValue() {
										return $.get(formState).defaultValues.name;
									}
								});
							}

							var node_7 = $.sibling(node_6, 2);

							{
								var consequent = ($$anchor) => {
									var p = root_2();
									var text_2 = $.only_child(p, true);

									$.template_effect(() => $.set_text(text_2, $.get(formState).errors.name));
									$.append($$anchor, p);
								};

								$.if(node_7, ($$render) => {
									if ($.get(formState).errors.name) $$render(consequent);
								});
							}

							$.reset(div);

							var div_1 = $.sibling(div, 2);
							var node_8 = $.child(div_1);

							Label(node_8, {
								for: 'email',
								class: 'group-data-[invalid=true]/field:text-destructive',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var fragment_4 = root_3();

									$.next();
									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});

							var node_9 = $.sibling(node_8, 2);

							{
								let $0 = $.derived(() => !!$.get(formState).errors?.email);

								Input(node_9, {
									id: 'email',
									name: 'email',
									placeholder: 'leerob@acme.com',
									class: 'group-data-[invalid=true]/field:border-destructive focus-visible:group-data-[invalid=true]/field:ring-destructive',
									get disabled() {
										return $.get(pending);
									},

									get 'aria-invalid'() {
										return $.get($0);
									},
									'aria-errormessage': 'error-email',
									get defaultValue() {
										return $.get(formState).defaultValues.email;
									}
								});
							}

							var node_10 = $.sibling(node_9, 2);

							{
								var consequent_1 = ($$anchor) => {
									var p_1 = root_4();
									var text_3 = $.only_child(p_1, true);

									$.template_effect(() => $.set_text(text_3, $.get(formState).errors.email));
									$.append($$anchor, p_1);
								};

								$.if(node_10, ($$render) => {
									if ($.get(formState).errors.email) $$render(consequent_1);
								});
							}

							$.reset(div_1);

							var div_2 = $.sibling(div_1, 2);
							var node_11 = $.child(div_2);

							Label(node_11, {
								for: 'message',
								class: 'group-data-[invalid=true]/field:text-destructive',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var fragment_5 = root_5();

									$.next();
									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});

							var node_12 = $.sibling(node_11, 2);

							{
								let $0 = $.derived(() => !!$.get(formState).errors?.message);

								Textarea(node_12, {
									id: 'message',
									name: 'message',
									placeholder: 'Type your message here...',
									class: 'group-data-[invalid=true]/field:border-destructive focus-visible:group-data-[invalid=true]/field:ring-destructive',
									get disabled() {
										return $.get(pending);
									},

									get 'aria-invalid'() {
										return $.get($0);
									},
									'aria-errormessage': 'error-message',
									get defaultValue() {
										return $.get(formState).defaultValues.message;
									}
								});
							}

							var node_13 = $.sibling(node_12, 2);

							{
								var consequent_2 = ($$anchor) => {
									var p_2 = root_6();
									var text_4 = $.only_child(p_2, true);

									$.template_effect(() => $.set_text(text_4, $.get(formState).errors.message));
									$.append($$anchor, p_2);
								};

								$.if(node_13, ($$render) => {
									if ($.get(formState).errors.message) $$render(consequent_2);
								});
							}

							$.reset(div_2);

							$.template_effect(() => {
								$.set_attribute(div, 'data-invalid', !!$.get(formState).errors?.name);
								$.set_attribute(div_1, 'data-invalid', !!$.get(formState).errors?.email);
								$.set_attribute(div_2, 'data-invalid', !!$.get(formState).errors?.message);
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_14 = $.sibling(node_4, 2);

				$.component(node_14, () => Card.Footer, ($$anchor, Card_Footer) => {
					Card_Footer($$anchor, {
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								type: 'submit',
								size: 'sm',
								get disabled() {
									return $.get(pending);
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text();

									$.template_effect(() => $.set_text(text_5, $.get(pending) ? "Sending..." : "Send Message"));
									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(form);
	$.event('submit', form, handleSubmit);
	$.append($$anchor, form);
	$.pop();
}
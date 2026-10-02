import 'svelte/internal/disclose-version';
import { z } from "zod";
import * as $ from 'svelte/internal/client';
import CalendarIcon from "@lucide/svelte/icons/calendar";

import {
	CalendarDate,
	DateFormatter,
	getLocalTimeZone,
	parseDate,
	today
} from "@internationalized/date";

import { toast } from "svelte-sonner";
import { defaults, superForm } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import * as Form from "$lib/registry/ui/form/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import { Button, buttonVariants } from "$lib/registry/ui/button/index.js";
import { Calendar } from "$lib/registry/ui/calendar/index.js";
import { cn } from "$lib/utils.js";

const formSchema = z.object({
	dob: z.string().refine((v) => v, { message: "A date of birth is required." })
});

var root = $.from_html(` <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <input hidden=""/>`, 1);
var root_3 = $.from_html(`<form method="POST" class="space-y-8"><!> <!></form>`);

export default function Date_picker_form($$anchor, $$props) {
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
	const df = new DateFormatter("en-US", { dateStyle: "long" });
	let value = $.derived(() => $formData().dob ? parseDate($formData().dob) : undefined);
	let placeholder = $.state($.proxy(today(getLocalTimeZone())));
	var form_1 = root_3();
	var node = $.child(form_1);

	$.component(node, () => Form.Field, ($$anchor, Form_Field) => {
		Form_Field($$anchor, {
			get form() {
				return form;
			},
			name: 'dob',
			class: 'flex flex-col',
			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				{
					const children = ($$anchor, $$arg0) => {
						let props = () => ($$arg0?.()).props;
						var fragment_1 = root_2();
						var node_2 = $.first_child(fragment_1);

						$.component(node_2, () => Form.Label, ($$anchor, Form_Label) => {
							Form_Label($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Date of birth');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => Popover.Root, ($$anchor, Popover_Root) => {
							Popover_Root($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_2 = root_1();
									var node_4 = $.first_child(fragment_2);

									{
										let $0 = $.derived(() => cn(buttonVariants({ variant: "outline" }), "w-[280px] justify-start ps-4 text-start font-normal", !$.get(value) && "text-muted-foreground"));

										$.component(node_4, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
											Popover_Trigger($$anchor, $.spread_props(props, {
												get class() {
													return $.get($0);
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var fragment_3 = root();
													var text_1 = $.first_child(fragment_3);
													var node_5 = $.sibling(text_1);

													CalendarIcon(node_5, { class: 'ms-auto size-4 opacity-50' });

													$.template_effect(($0) => $.set_text(text_1, `${$0 ?? ''} `), [
														() => $.get(value)
															? df.format($.get(value).toDate(getLocalTimeZone()))
															: "Pick a date"
													]);

													$.append($$anchor, fragment_3);
												},
												$$slots: { default: true }
											}));
										});
									}

									var node_6 = $.sibling(node_4, 2);

									$.component(node_6, () => Popover.Content, ($$anchor, Popover_Content) => {
										Popover_Content($$anchor, {
											class: 'w-auto p-0',
											side: 'top',
											children: ($$anchor, $$slotProps) => {
												{
													let $0 = $.derived(() => new CalendarDate(1900, 1, 1));
													let $1 = $.derived(() => today(getLocalTimeZone()));

													Calendar($$anchor, {
														type: 'single',
														get value() {
															return $.get(value);
														},
														captionLayout: 'dropdown',
														get minValue() {
															return $.get($0);
														},

														get maxValue() {
															return $.get($1);
														},
														calendarLabel: 'Date of birth',
														onValueChange: (v) => {
															if (v) {
																$.store_mutate(formData, $.untrack($formData).dob = v.toString(), $.untrack($formData));
															} else {
																$.store_mutate(formData, $.untrack($formData).dob = "", $.untrack($formData));
															}
														},

														get placeholder() {
															return $.get(placeholder);
														},

														set placeholder($$value) {
															$.set(placeholder, $$value, true);
														}
													});
												}
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_2);
								},
								$$slots: { default: true }
							});
						});

						var node_7 = $.sibling(node_3, 2);

						$.component(node_7, () => Form.Description, ($$anchor, Form_Description) => {
							Form_Description($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Your date of birth is used to calculate your age');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});
						});

						var node_8 = $.sibling(node_7, 2);

						$.component(node_8, () => Form.FieldErrors, ($$anchor, Form_FieldErrors) => {
							Form_FieldErrors($$anchor, {});
						});

						var input = $.sibling(node_8, 2);

						$.remove_input_defaults(input);

						$.template_effect(() => {
							$.set_value(input, $formData().dob);
							$.set_attribute(input, 'name', props().name);
						});

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

	var node_9 = $.sibling(node, 2);

	Button(node_9, {
		type: 'submit',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Submit');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	$.reset(form_1);
	$.action(form_1, ($$node) => enhance?.($$node));
	$.append($$anchor, form_1);
	$.pop();
	$$cleanup();
}
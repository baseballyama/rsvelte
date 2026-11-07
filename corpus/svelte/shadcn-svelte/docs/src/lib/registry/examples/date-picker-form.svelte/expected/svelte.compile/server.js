import * as $ from 'svelte/internal/server';
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
import { z } from "zod";

const formSchema = z.object({
	dob: z.string().refine((v) => v, { message: "A date of birth is required." })
});

export default function Date_picker_form($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

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

		let value = $.derived(() => $.store_get($$store_subs ??= {}, '$formData', formData).dob
			? parseDate($.store_get($$store_subs ??= {}, '$formData', formData).dob)
			: undefined);

		let placeholder = today(getLocalTimeZone());
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<form method="POST" class="space-y-8">`);

			if (Form.Field) {
				$$renderer.push('<!--[-->');

				Form.Field($$renderer, {
					form,
					name: 'dob',
					class: 'flex flex-col',
					children: ($$renderer) => {
						{
							function children($$renderer, { props }) {
								if (Form.Label) {
									$$renderer.push('<!--[-->');

									Form.Label($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Date of birth`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Popover.Root) {
									$$renderer.push('<!--[-->');

									Popover.Root($$renderer, {
										children: ($$renderer) => {
											if (Popover.Trigger) {
												$$renderer.push('<!--[-->');

												Popover.Trigger($$renderer, $.spread_props([
													props,
													{
														class: cn(buttonVariants({ variant: "outline" }), "w-[280px] justify-start ps-4 text-start font-normal", !value() && "text-muted-foreground"),
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(value()
																? df.format(value().toDate(getLocalTimeZone()))
																: "Pick a date")} `);

															CalendarIcon($$renderer, { class: 'ms-auto size-4 opacity-50' });
															$$renderer.push(`<!---->`);
														},
														$$slots: { default: true }
													}
												]));

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Popover.Content) {
												$$renderer.push('<!--[-->');

												Popover.Content($$renderer, {
													class: 'w-auto p-0',
													side: 'top',
													children: ($$renderer) => {
														Calendar($$renderer, {
															type: 'single',
															value: value(),
															captionLayout: 'dropdown',
															minValue: new CalendarDate(1900, 1, 1),
															maxValue: today(getLocalTimeZone()),
															calendarLabel: 'Date of birth',
															onValueChange: (v) => {
																if (v) {
																	$.store_mutate($$store_subs ??= {}, '$formData', formData, $.store_get($$store_subs ??= {}, '$formData', formData).dob = v.toString());
																} else {
																	$.store_mutate($$store_subs ??= {}, '$formData', formData, $.store_get($$store_subs ??= {}, '$formData', formData).dob = "");
																}
															},

															get placeholder() {
																return placeholder;
															},

															set placeholder($$value) {
																placeholder = $$value;
																$$settled = false;
															}
														});
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Form.Description) {
									$$renderer.push('<!--[-->');

									Form.Description($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Your date of birth is used to calculate your age`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Form.FieldErrors) {
									$$renderer.push('<!--[-->');
									Form.FieldErrors($$renderer, {});
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` <input hidden=""${$.attr('value', $.store_get($$store_subs ??= {}, '$formData', formData).dob)}${$.attr('name', props.name)}/>`);
							}

							if (Form.Control) {
								$$renderer.push('<!--[-->');
								Form.Control($$renderer, { children, $$slots: { default: true } });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			Button($$renderer, {
				type: 'submit',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Submit`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></form>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}
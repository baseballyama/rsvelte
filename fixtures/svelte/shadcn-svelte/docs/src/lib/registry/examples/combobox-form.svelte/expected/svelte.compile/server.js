import * as $ from 'svelte/internal/server';
import CheckIcon from "@lucide/svelte/icons/check";
import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
import { useId } from "bits-ui";
import { tick } from "svelte";
import { toast } from "svelte-sonner";
import { defaults, superForm } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import * as Command from "$lib/registry/ui/command/index.js";
import * as Form from "$lib/registry/ui/form/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import { buttonVariants } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";
import { z } from "zod";

const languages = [
	{ label: "English", value: "en" },
	{ label: "French", value: "fr" },
	{ label: "German", value: "de" },
	{ label: "Spanish", value: "es" },
	{ label: "Portuguese", value: "pt" },
	{ label: "Russian", value: "ru" },
	{ label: "Japanese", value: "ja" },
	{ label: "Korean", value: "ko" },
	{ label: "Chinese", value: "zh" }
];

const formSchema = z.object({
	language: z.enum(["en", "fr", "de", "es", "pt", "ru", "ja", "ko", "zh"])
});

export default function Combobox_form($$renderer, $$props) {
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
		let open = false;

		// We want to refocus the trigger button when the user selects
		// an item from the list so users can continue navigating the
		// rest of the form with the keyboard.
		function closeAndFocusTrigger(triggerId) {
			open = false;

			tick().then(() => {
				document.getElementById(triggerId)?.focus();
			});
		}

		const triggerId = useId();
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<form method="POST" class="space-y-6">`);

			if (Form.Field) {
				$$renderer.push('<!--[-->');

				Form.Field($$renderer, {
					form,
					name: 'language',
					class: 'flex flex-col',
					children: ($$renderer) => {
						if (Popover.Root) {
							$$renderer.push('<!--[-->');

							Popover.Root($$renderer, {
								get open() {
									return open;
								},

								set open($$value) {
									open = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									{
										function children($$renderer, { props }) {
											if (Form.Label) {
												$$renderer.push('<!--[-->');

												Form.Label($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Language`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Popover.Trigger) {
												$$renderer.push('<!--[-->');

												Popover.Trigger($$renderer, $.spread_props([
													{
														class: cn(buttonVariants({ variant: "outline" }), "w-[200px] justify-between", !$.store_get($$store_subs ??= {}, '$formData', formData).language && "text-muted-foreground"),
														role: 'combobox'
													},
													props,
													{
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(languages.find((f) => f.value === $.store_get($$store_subs ??= {}, '$formData', formData).language)?.label ?? "Select language")} `);
															ChevronsUpDownIcon($$renderer, { class: 'opacity-50' });
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

											$$renderer.push(` <input hidden=""${$.attr('value', $.store_get($$store_subs ??= {}, '$formData', formData).language)}${$.attr('name', props.name)}/>`);
										}

										if (Form.Control) {
											$$renderer.push('<!--[-->');
											Form.Control($$renderer, { id: triggerId, children, $$slots: { default: true } });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									}

									$$renderer.push(` `);

									if (Popover.Content) {
										$$renderer.push('<!--[-->');

										Popover.Content($$renderer, {
											class: 'w-[200px] p-0',
											children: ($$renderer) => {
												if (Command.Root) {
													$$renderer.push('<!--[-->');

													Command.Root($$renderer, {
														children: ($$renderer) => {
															if (Command.Input) {
																$$renderer.push('<!--[-->');

																Command.Input($$renderer, {
																	autofocus: true,
																	placeholder: 'Search language...',
																	class: 'h-9'
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Command.Empty) {
																$$renderer.push('<!--[-->');

																Command.Empty($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->No language found.`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Command.Group) {
																$$renderer.push('<!--[-->');

																Command.Group($$renderer, {
																	value: 'languages',
																	children: ($$renderer) => {
																		$$renderer.push(`<!--[-->`);

																		const each_array = $.ensure_array_like(languages);

																		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																			let language = each_array[$$index];

																			if (Command.Item) {
																				$$renderer.push('<!--[-->');

																				Command.Item($$renderer, {
																					value: language.label,
																					onSelect: () => {
																						$.store_mutate($$store_subs ??= {}, '$formData', formData, $.store_get($$store_subs ??= {}, '$formData', formData).language = language.value);
																						closeAndFocusTrigger(triggerId);
																					},

																					children: ($$renderer) => {
																						$$renderer.push(`<!---->${$.escape(language.label)} `);

																						CheckIcon($$renderer, {
																							class: cn("ms-auto", language.value !== $.store_get($$store_subs ??= {}, '$formData', formData).language && "text-transparent")
																						});

																						$$renderer.push(`<!---->`);
																					},
																					$$slots: { default: true }
																				});

																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}
																		}

																		$$renderer.push(`<!--]-->`);
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
									$$renderer.push(`<!---->This is the language that will be used in the dashboard.`);
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
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Form.Button) {
				$$renderer.push('<!--[-->');

				Form.Button($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Submit`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</form>`);
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
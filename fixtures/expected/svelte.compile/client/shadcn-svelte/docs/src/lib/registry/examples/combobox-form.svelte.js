import 'svelte/internal/disclose-version';
import { z } from "zod";
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(` <!>`, 1);
var root_1 = $.from_html(`<!> <!> <input hidden=""/>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<form method="POST" class="space-y-6"><!> <!></form>`);

export default function Combobox_form($$anchor, $$props) {
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
	var form_1 = root_4();
	var node = $.child(form_1);

	$.component(node, () => Form.Field, ($$anchor, Form_Field) => {
		Form_Field($$anchor, {
			get form() {
				return form;
			},
			name: 'language',
			class: 'flex flex-col',
			children: ($$anchor, $$slotProps) => {
				var fragment = root_2();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Popover.Root, ($$anchor, Popover_Root) => {
					Popover_Root($$anchor, {
						get open() {
							return open;
						},

						set open($$value) {
							open = $$value;
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root_3();
							var node_2 = $.first_child(fragment_1);

							{
								const children = ($$anchor, $$arg0) => {
									let props = () => ($$arg0?.()).props;
									var fragment_2 = root_1();
									var node_3 = $.first_child(fragment_2);

									$.component(node_3, () => Form.Label, ($$anchor, Form_Label) => {
										Form_Label($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Language');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									var node_4 = $.sibling(node_3, 2);

									{
										let $0 = $.derived(() => cn(buttonVariants({ variant: "outline" }), "w-[200px] justify-between", !$formData().language && "text-muted-foreground"));

										$.component(node_4, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
											Popover_Trigger($$anchor, $.spread_props(
												{
													get class() {
														return $.get($0);
													},
													role: 'combobox'
												},
												props,
												{
													children: ($$anchor, $$slotProps) => {
														$.next();

														var fragment_3 = root();
														var text_1 = $.first_child(fragment_3);
														var node_5 = $.sibling(text_1);

														ChevronsUpDownIcon(node_5, { class: 'opacity-50' });

														$.template_effect(($0) => $.set_text(text_1, `${$0 ?? ''} `), [
															() => languages.find((f) => f.value === $formData().language)?.label ?? "Select language"
														]);

														$.append($$anchor, fragment_3);
													},
													$$slots: { default: true }
												}
											));
										});
									}

									var input = $.sibling(node_4, 2);

									$.remove_input_defaults(input);

									$.template_effect(() => {
										$.set_value(input, $formData().language);
										$.set_attribute(input, 'name', props().name);
									});

									$.append($$anchor, fragment_2);
								};

								$.component(node_2, () => Form.Control, ($$anchor, Form_Control) => {
									Form_Control($$anchor, {
										get id() {
											return triggerId;
										},
										children,
										$$slots: { default: true }
									});
								});
							}

							var node_6 = $.sibling(node_2, 2);

							$.component(node_6, () => Popover.Content, ($$anchor, Popover_Content) => {
								Popover_Content($$anchor, {
									class: 'w-[200px] p-0',
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = $.comment();
										var node_7 = $.first_child(fragment_4);

										$.component(node_7, () => Command.Root, ($$anchor, Command_Root) => {
											Command_Root($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root_2();
													var node_8 = $.first_child(fragment_5);

													$.component(node_8, () => Command.Input, ($$anchor, Command_Input) => {
														Command_Input($$anchor, {
															autofocus: true,
															placeholder: 'Search language...',
															class: 'h-9'
														});
													});

													var node_9 = $.sibling(node_8, 2);

													$.component(node_9, () => Command.Empty, ($$anchor, Command_Empty) => {
														Command_Empty($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_2 = $.text('No language found.');

																$.append($$anchor, text_2);
															},
															$$slots: { default: true }
														});
													});

													var node_10 = $.sibling(node_9, 2);

													$.component(node_10, () => Command.Group, ($$anchor, Command_Group) => {
														Command_Group($$anchor, {
															value: 'languages',
															children: ($$anchor, $$slotProps) => {
																var fragment_6 = $.comment();
																var node_11 = $.first_child(fragment_6);

																$.each(node_11, 17, () => languages, (language) => language.value, ($$anchor, language) => {
																	var fragment_7 = $.comment();
																	var node_12 = $.first_child(fragment_7);

																	$.component(node_12, () => Command.Item, ($$anchor, Command_Item) => {
																		Command_Item($$anchor, {
																			get value() {
																				return $.get(language).label;
																			},

																			onSelect: () => {
																				$.store_mutate(formData, $.untrack($formData).language = $.get(language).value, $.untrack($formData));
																				closeAndFocusTrigger(triggerId);
																			},

																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var fragment_8 = root();
																				var text_3 = $.first_child(fragment_8);
																				var node_13 = $.sibling(text_3);

																				{
																					let $0 = $.derived(() => cn("ms-auto", $.get(language).value !== $formData().language && "text-transparent"));

																					CheckIcon(node_13, {
																						get class() {
																							return $.get($0);
																						}
																					});
																				}

																				$.template_effect(() => $.set_text(text_3, `${$.get(language).label ?? ''} `));
																				$.append($$anchor, fragment_8);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_7);
																});

																$.append($$anchor, fragment_6);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				var node_14 = $.sibling(node_1, 2);

				$.component(node_14, () => Form.Description, ($$anchor, Form_Description) => {
					Form_Description($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('This is the language that will be used in the dashboard.');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});
				});

				var node_15 = $.sibling(node_14, 2);

				$.component(node_15, () => Form.FieldErrors, ($$anchor, Form_FieldErrors) => {
					Form_FieldErrors($$anchor, {});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	var node_16 = $.sibling(node, 2);

	$.component(node_16, () => Form.Button, ($$anchor, Form_Button) => {
		Form_Button($$anchor, {
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_5 = $.text('Submit');

				$.append($$anchor, text_5);
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
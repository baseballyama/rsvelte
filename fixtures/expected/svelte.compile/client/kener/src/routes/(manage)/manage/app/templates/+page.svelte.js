import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "$lib/components/ui/button/index.js";
import { Spinner } from "$lib/components/ui/spinner/index.js";
import { Badge } from "$lib/components/ui/badge/index.js";
import * as Card from "$lib/components/ui/card/index.js";
import * as Select from "$lib/components/ui/select/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import { Textarea } from "$lib/components/ui/textarea/index.js";
import { Label } from "$lib/components/ui/label/index.js";
import SaveIcon from "@lucide/svelte/icons/save";
import FileTextIcon from "@lucide/svelte/icons/file-text";
import MailIcon from "@lucide/svelte/icons/mail";
import Loader from "@lucide/svelte/icons/loader";
import { toast } from "svelte-sonner";
import { mode } from "mode-watcher";
import CodeMirror from "svelte-codemirror-editor";
import { html } from "@codemirror/lang-html";
import { githubLight, githubDark } from "@uiw/codemirror-theme-github";
import { onMount } from "svelte";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";

var root = $.from_html(`<div class="flex items-center justify-center py-12"><!></div>`);
var root_1 = $.from_html(`<!> <h3 class="mb-2 text-lg font-semibold">No Templates Found</h3> <p class="text-muted-foreground text-center">There are no email templates configured yet.</p>`, 1);
var root_2 = $.from_html(`<!> Edit Template`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<div class="space-y-2"><!> <!> <p class="text-muted-foreground text-xs">The subject line for the email. You can use Mustache variables like <code class="bg-muted rounded px-1"></code></p></div> <div class="space-y-2"><!> <p class="text-muted-foreground text-xs">The HTML content of the email. Use Mustache variables for dynamic content.</p> <div class="overflow-hidden rounded-md border"><!></div></div> <div class="space-y-2"><!> <p class="text-muted-foreground text-xs">Plain text version of the email for clients that don't support HTML</p> <!></div>`, 1);
var root_5 = $.from_html(`<div class="space-y-2"><!> <!></div> <!>`, 1);
var root_6 = $.from_html(`<!> Update Template`, 1);
var root_7 = $.from_html(`<!> <!> <!>`, 1);
var root_8 = $.from_html(`<div class="container mx-auto space-y-6 py-6"><!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	// State
	let loading = $.state(true);

	let saving = $.state(false);
	let templates = $.state($.proxy([]));
	let selectedTemplateId = $.state("");

	// Form state for selected template
	let templateSubject = $.state("");

	let templateHtmlBody = $.state("");
	let templateTextBody = $.state("");

	// Derived: selected template
	let selectedTemplate = $.derived(() => $.get(templates).find((t) => t.template_id === $.get(selectedTemplateId)));

	// Fetch templates on mount
	onMount(() => {
		fetchTemplates();
	});

	// Handle template selection change
	function handleTemplateSelect(templateId) {
		$.set(selectedTemplateId, templateId, true);

		const template = $.get(templates).find((t) => t.template_id === templateId);

		if (template) {
			$.set(templateSubject, template.template_subject || "", true);
			$.set(templateHtmlBody, template.template_html_body || "", true);
			$.set(templateTextBody, template.template_text_body || "", true);
		} else {
			$.set(templateSubject, "");
			$.set(templateHtmlBody, "");
			$.set(templateTextBody, "");
		}
	}

	async function fetchTemplates() {
		$.set(loading, true);

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "getGeneralEmailTemplates", data: {} })
			});

			const result = await response.json();

			if (result.error) {
				toast.error(result.error);
			} else {
				$.set(templates, result, true);

				// Auto-select first template if available
				if ($.get(templates).length > 0 && !$.get(selectedTemplateId)) {
					handleTemplateSelect($.get(templates)[0].template_id);
				}
			}
		} catch(error) {
			console.error("Error fetching templates:", error);
			toast.error("Failed to load templates");
		} finally {
			$.set(loading, false);
		}
	}

	async function updateTemplate() {
		if (!$.get(selectedTemplateId)) {
			toast.error("Please select a template");

			return;
		}

		$.set(saving, true);

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "updateGeneralEmailTemplate",
					data: {
						templateId: $.get(selectedTemplateId),
						template_subject: $.get(templateSubject),
						template_html_body: $.get(templateHtmlBody),
						template_text_body: $.get(templateTextBody)
					}
				})
			});

			const result = await response.json();

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success("Template updated successfully");

				// Update local state
				const index = $.get(templates).findIndex((t) => t.template_id === $.get(selectedTemplateId));

				if (index !== -1) {
					$.get(templates)[index] = {
						...$.get(templates)[index],
						template_subject: $.get(templateSubject),
						template_html_body: $.get(templateHtmlBody),
						template_text_body: $.get(templateTextBody)
					};
				}
			}
		} catch(error) {
			console.error("Error updating template:", error);
			toast.error("Failed to update template");
		} finally {
			$.set(saving, false);
		}
	}

	function formatTemplateId(id) {
		// Convert snake_case or kebab-case to Title Case
		return id.replace(/[-_]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
	}

	var div = root_8();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();
			var node_1 = $.child(div_1);

			Spinner(node_1, { class: 'size-8' });
			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		var consequent_1 = ($$anchor) => {
			var fragment = $.comment();
			var node_2 = $.first_child(fragment);

			$.component(node_2, () => Card.Root, ($$anchor, Card_Root) => {
				Card_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = $.comment();
						var node_3 = $.first_child(fragment_1);

						$.component(node_3, () => Card.Content, ($$anchor, Card_Content) => {
							Card_Content($$anchor, {
								class: 'flex flex-col items-center justify-center py-12',
								children: ($$anchor, $$slotProps) => {
									var fragment_2 = root_1();
									var node_4 = $.first_child(fragment_2);

									MailIcon(node_4, { class: 'text-muted-foreground mb-4 size-12' });
									$.next(4);
									$.append($$anchor, fragment_2);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment);
		};

		var alternate_2 = ($$anchor) => {
			var fragment_3 = $.comment();
			var node_5 = $.first_child(fragment_3);

			$.component(node_5, () => Card.Root, ($$anchor, Card_Root_1) => {
				Card_Root_1($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_4 = root_7();
						var node_6 = $.first_child(fragment_4);

						$.component(node_6, () => Card.Header, ($$anchor, Card_Header) => {
							Card_Header($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root_3();
									var node_7 = $.first_child(fragment_5);

									$.component(node_7, () => Card.Title, ($$anchor, Card_Title) => {
										Card_Title($$anchor, {
											class: 'flex items-center gap-2',
											children: ($$anchor, $$slotProps) => {
												var fragment_6 = root_2();
												var node_8 = $.first_child(fragment_6);

												FileTextIcon(node_8, { class: 'size-5' });
												$.next();
												$.append($$anchor, fragment_6);
											},
											$$slots: { default: true }
										});
									});

									var node_9 = $.sibling(node_7, 2);

									$.component(node_9, () => Card.Description, ($$anchor, Card_Description) => {
										Card_Description($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Select a template from the dropdown to view and edit its content');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});
						});

						var node_10 = $.sibling(node_6, 2);

						$.component(node_10, () => Card.Content, ($$anchor, Card_Content_1) => {
							Card_Content_1($$anchor, {
								class: 'space-y-6',
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = root_5();
									var div_2 = $.first_child(fragment_7);
									var node_11 = $.child(div_2);

									Label(node_11, {
										for: 'template-select',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_1 = $.text('Select Template');

											$.append($$anchor, text_1);
										},
										$$slots: { default: true }
									});

									var node_12 = $.sibling(node_11, 2);

									$.component(node_12, () => Select.Root, ($$anchor, Select_Root) => {
										Select_Root($$anchor, {
											type: 'single',
											get value() {
												return $.get(selectedTemplateId);
											},

											onValueChange: (value) => {
												if (value) handleTemplateSelect(value);
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_8 = root_3();
												var node_13 = $.first_child(fragment_8);

												$.component(node_13, () => Select.Trigger, ($$anchor, Select_Trigger) => {
													Select_Trigger($$anchor, {
														class: 'w-full md:w-[400px]',
														children: ($$anchor, $$slotProps) => {
															var fragment_9 = $.comment();
															var node_14 = $.first_child(fragment_9);

															{
																var consequent_2 = ($$anchor) => {
																	var text_2 = $.text();

																	$.template_effect(($0) => $.set_text(text_2, $0), [() => formatTemplateId($.get(selectedTemplateId))]);
																	$.append($$anchor, text_2);
																};

																var alternate = ($$anchor) => {
																	var text_3 = $.text('Select a template...');

																	$.append($$anchor, text_3);
																};

																$.if(node_14, ($$render) => {
																	if ($.get(selectedTemplateId)) $$render(consequent_2); else $$render(alternate, -1);
																});
															}

															$.append($$anchor, fragment_9);
														},
														$$slots: { default: true }
													});
												});

												var node_15 = $.sibling(node_13, 2);

												$.component(node_15, () => Select.Content, ($$anchor, Select_Content) => {
													Select_Content($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_11 = $.comment();
															var node_16 = $.first_child(fragment_11);

															$.each(node_16, 17, () => $.get(templates), (template) => template.template_id, ($$anchor, template) => {
																var fragment_12 = $.comment();
																var node_17 = $.first_child(fragment_12);

																$.component(node_17, () => Select.Item, ($$anchor, Select_Item) => {
																	Select_Item($$anchor, {
																		get value() {
																			return $.get(template).template_id;
																		},

																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_4 = $.text();

																			$.template_effect(($0) => $.set_text(text_4, $0), [() => formatTemplateId($.get(template).template_id)]);
																			$.append($$anchor, text_4);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_12);
															});

															$.append($$anchor, fragment_11);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_8);
											},
											$$slots: { default: true }
										});
									});

									$.reset(div_2);

									var node_18 = $.sibling(div_2, 2);

									{
										var consequent_3 = ($$anchor) => {
											var fragment_14 = root_4();
											var div_3 = $.first_child(fragment_14);
											var node_19 = $.child(div_3);

											Label(node_19, {
												for: 'template-subject',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_5 = $.text('Subject');

													$.append($$anchor, text_5);
												},
												$$slots: { default: true }
											});

											var node_20 = $.sibling(node_19, 2);

											Input(node_20, {
												id: 'template-subject',
												placeholder: 'Email subject line',
												get value() {
													return $.get(templateSubject);
												},

												set value($$value) {
													$.set(templateSubject, $$value, true);
												}
											});

											var p = $.sibling(node_20, 2);
											var code = $.sibling($.child(p));

											code.textContent = '{{variable}}';
											$.reset(p);
											$.reset(div_3);

											var div_4 = $.sibling(div_3, 2);
											var node_21 = $.child(div_4);

											Label(node_21, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_6 = $.text('HTML Body');

													$.append($$anchor, text_6);
												},
												$$slots: { default: true }
											});

											var div_5 = $.sibling(node_21, 4);
											var node_22 = $.child(div_5);

											{
												let $0 = $.derived(html);
												let $1 = $.derived(() => mode.current === "dark" ? githubDark : githubLight);

												CodeMirror(node_22, {
													get lang() {
														return $.get($0);
													},

													get theme() {
														return $.get($1);
													},
													styles: { "&": { width: "100%", height: "400px" } },
													get value() {
														return $.get(templateHtmlBody);
													},

													set value($$value) {
														$.set(templateHtmlBody, $$value, true);
													}
												});
											}

											$.reset(div_5);
											$.reset(div_4);

											var div_6 = $.sibling(div_4, 2);
											var node_23 = $.child(div_6);

											Label(node_23, {
												for: 'template-text-body',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_7 = $.text('Text Body');

													$.append($$anchor, text_7);
												},
												$$slots: { default: true }
											});

											var node_24 = $.sibling(node_23, 4);

											Textarea(node_24, {
												id: 'template-text-body',
												placeholder: 'Plain text email content',
												rows: 8,
												get value() {
													return $.get(templateTextBody);
												},

												set value($$value) {
													$.set(templateTextBody, $$value, true);
												}
											});

											$.reset(div_6);
											$.append($$anchor, fragment_14);
										};

										$.if(node_18, ($$render) => {
											if ($.get(selectedTemplateId)) $$render(consequent_3);
										});
									}

									$.append($$anchor, fragment_7);
								},
								$$slots: { default: true }
							});
						});

						var node_25 = $.sibling(node_10, 2);

						{
							var consequent_5 = ($$anchor) => {
								var fragment_15 = $.comment();
								var node_26 = $.first_child(fragment_15);

								$.component(node_26, () => Card.Footer, ($$anchor, Card_Footer) => {
									Card_Footer($$anchor, {
										class: 'flex justify-end',
										children: ($$anchor, $$slotProps) => {
											Button($$anchor, {
												onclick: updateTemplate,
												get disabled() {
													return $.get(saving);
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_17 = root_6();
													var node_27 = $.first_child(fragment_17);

													{
														var consequent_4 = ($$anchor) => {
															Loader($$anchor, { class: 'size-4 animate-spin' });
														};

														var alternate_1 = ($$anchor) => {
															SaveIcon($$anchor, { class: 'size-4' });
														};

														$.if(node_27, ($$render) => {
															if ($.get(saving)) $$render(consequent_4); else $$render(alternate_1, -1);
														});
													}

													$.next();
													$.append($$anchor, fragment_17);
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_15);
							};

							$.if(node_25, ($$render) => {
								if ($.get(selectedTemplateId)) $$render(consequent_5);
							});
						}

						$.append($$anchor, fragment_4);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_3);
		};

		$.if(node, ($$render) => {
			if ($.get(loading)) $$render(consequent); else if ($.get(templates).length === 0) $$render(consequent_1, 1); else $$render(alternate_2, -1);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}
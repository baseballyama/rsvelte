import * as $ from 'svelte/internal/server';
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

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// State
		let loading = true;

		let saving = false;
		let templates = [];
		let selectedTemplateId = "";

		// Form state for selected template
		let templateSubject = "";

		let templateHtmlBody = "";
		let templateTextBody = "";

		// Derived: selected template
		let selectedTemplate = $.derived(() => templates.find((t) => t.template_id === selectedTemplateId));

		// Fetch templates on mount
		onMount(() => {
			fetchTemplates();
		});

		// Handle template selection change
		function handleTemplateSelect(templateId) {
			selectedTemplateId = templateId;

			const template = templates.find((t) => t.template_id === templateId);

			if (template) {
				templateSubject = template.template_subject || "";
				templateHtmlBody = template.template_html_body || "";
				templateTextBody = template.template_text_body || "";
			} else {
				templateSubject = "";
				templateHtmlBody = "";
				templateTextBody = "";
			}
		}

		async function fetchTemplates() {
			loading = true;

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
					templates = result;

					// Auto-select first template if available
					if (templates.length > 0 && !selectedTemplateId) {
						handleTemplateSelect(templates[0].template_id);
					}
				}
			} catch(error) {
				console.error("Error fetching templates:", error);
				toast.error("Failed to load templates");
			} finally {
				loading = false;
			}
		}

		async function updateTemplate() {
			if (!selectedTemplateId) {
				toast.error("Please select a template");

				return;
			}

			saving = true;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "updateGeneralEmailTemplate",
						data: {
							templateId: selectedTemplateId,
							template_subject: templateSubject,
							template_html_body: templateHtmlBody,
							template_text_body: templateTextBody
						}
					})
				});

				const result = await response.json();

				if (result.error) {
					toast.error(result.error);
				} else {
					toast.success("Template updated successfully");

					// Update local state
					const index = templates.findIndex((t) => t.template_id === selectedTemplateId);

					if (index !== -1) {
						templates[index] = {
							...templates[index],
							template_subject: templateSubject,
							template_html_body: templateHtmlBody,
							template_text_body: templateTextBody
						};
					}
				}
			} catch(error) {
				console.error("Error updating template:", error);
				toast.error("Failed to update template");
			} finally {
				saving = false;
			}
		}

		function formatTemplateId(id) {
			// Convert snake_case or kebab-case to Title Case
			return id.replace(/[-_]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="container mx-auto space-y-6 py-6">`);

			if (loading) {
				$$renderer.push(`<!--[0--><div class="flex items-center justify-center py-12">`);
				Spinner($$renderer, { class: 'size-8' });
				$$renderer.push(`<!----></div>`);
			} else if (templates.length === 0) {
				$$renderer.push('<!--[1-->');

				if (Card.Root) {
					$$renderer.push('<!--[-->');

					Card.Root($$renderer, {
						children: ($$renderer) => {
							if (Card.Content) {
								$$renderer.push('<!--[-->');

								Card.Content($$renderer, {
									class: 'flex flex-col items-center justify-center py-12',
									children: ($$renderer) => {
										MailIcon($$renderer, { class: 'text-muted-foreground mb-4 size-12' });
										$$renderer.push(`<!----> <h3 class="mb-2 text-lg font-semibold">No Templates Found</h3> <p class="text-muted-foreground text-center">There are no email templates configured yet.</p>`);
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
			} else {
				$$renderer.push('<!--[-1-->');

				if (Card.Root) {
					$$renderer.push('<!--[-->');

					Card.Root($$renderer, {
						children: ($$renderer) => {
							if (Card.Header) {
								$$renderer.push('<!--[-->');

								Card.Header($$renderer, {
									children: ($$renderer) => {
										if (Card.Title) {
											$$renderer.push('<!--[-->');

											Card.Title($$renderer, {
												class: 'flex items-center gap-2',
												children: ($$renderer) => {
													FileTextIcon($$renderer, { class: 'size-5' });
													$$renderer.push(`<!----> Edit Template`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Card.Description) {
											$$renderer.push('<!--[-->');

											Card.Description($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Select a template from the dropdown to view and edit its content`);
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

							if (Card.Content) {
								$$renderer.push('<!--[-->');

								Card.Content($$renderer, {
									class: 'space-y-6',
									children: ($$renderer) => {
										$$renderer.push(`<div class="space-y-2">`);

										Label($$renderer, {
											for: 'template-select',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Select Template`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										if (Select.Root) {
											$$renderer.push('<!--[-->');

											Select.Root($$renderer, {
												type: 'single',
												value: selectedTemplateId,
												onValueChange: (value) => {
													if (value) handleTemplateSelect(value);
												},

												children: ($$renderer) => {
													if (Select.Trigger) {
														$$renderer.push('<!--[-->');

														Select.Trigger($$renderer, {
															class: 'w-full md:w-[400px]',
															children: ($$renderer) => {
																if (selectedTemplateId) {
																	$$renderer.push(`<!--[0-->${$.escape(formatTemplateId(selectedTemplateId))}`);
																} else {
																	$$renderer.push(`<!--[-1-->Select a template...`);
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

													$$renderer.push(` `);

													if (Select.Content) {
														$$renderer.push('<!--[-->');

														Select.Content($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!--[-->`);

																const each_array = $.ensure_array_like(templates);

																for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																	let template = each_array[$$index];

																	if (Select.Item) {
																		$$renderer.push('<!--[-->');

																		Select.Item($$renderer, {
																			value: template.template_id,
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->${$.escape(formatTemplateId(template.template_id))}`);
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

										$$renderer.push(`</div> `);

										if (selectedTemplateId) {
											$$renderer.push(`<!--[0--><div class="space-y-2">`);

											Label($$renderer, {
												for: 'template-subject',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Subject`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											Input($$renderer, {
												id: 'template-subject',
												placeholder: 'Email subject line',
												get value() {
													return templateSubject;
												},

												set value($$value) {
													templateSubject = $$value;
													$$settled = false;
												}
											});

											$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">The subject line for the email. You can use Mustache variables like <code class="bg-muted rounded px-1">{{variable}}</code></p></div> <div class="space-y-2">`);

											Label($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->HTML Body`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">The HTML content of the email. Use Mustache variables for dynamic content.</p> <div class="overflow-hidden rounded-md border">`);

											CodeMirror($$renderer, {
												lang: html(),
												theme: mode.current === "dark" ? githubDark : githubLight,
												styles: { "&": { width: "100%", height: "400px" } },
												get value() {
													return templateHtmlBody;
												},

												set value($$value) {
													templateHtmlBody = $$value;
													$$settled = false;
												}
											});

											$$renderer.push(`<!----></div></div> <div class="space-y-2">`);

											Label($$renderer, {
												for: 'template-text-body',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Text Body`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">Plain text version of the email for clients that don't support HTML</p> `);

											Textarea($$renderer, {
												id: 'template-text-body',
												placeholder: 'Plain text email content',
												rows: 8,
												get value() {
													return templateTextBody;
												},

												set value($$value) {
													templateTextBody = $$value;
													$$settled = false;
												}
											});

											$$renderer.push(`<!----></div>`);
										} else {
											$$renderer.push('<!--[-1-->');
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

							$$renderer.push(` `);

							if (selectedTemplateId) {
								$$renderer.push('<!--[0-->');

								if (Card.Footer) {
									$$renderer.push('<!--[-->');

									Card.Footer($$renderer, {
										class: 'flex justify-end',
										children: ($$renderer) => {
											Button($$renderer, {
												onclick: updateTemplate,
												disabled: saving,
												children: ($$renderer) => {
													if (saving) {
														$$renderer.push('<!--[0-->');
														Loader($$renderer, { class: 'size-4 animate-spin' });
													} else {
														$$renderer.push('<!--[-1-->');
														SaveIcon($$renderer, { class: 'size-4' });
													}

													$$renderer.push(`<!--]--> Update Template`);
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							} else {
								$$renderer.push('<!--[-1-->');
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
			}

			$$renderer.push(`<!--]--></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}
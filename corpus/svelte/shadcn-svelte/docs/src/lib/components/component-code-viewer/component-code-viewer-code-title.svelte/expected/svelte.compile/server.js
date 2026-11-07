import * as $ from 'svelte/internal/server';
import * as Select from "$lib/registry/ui/select/index.js";
import ComponentCodeViewerCopyCodeButton from "./component-code-viewer-copy-code-button.svelte";
import { ComponentCodeViewerContext } from "./component-code-viewer.svelte";
import { getIconForLanguageExtension } from "../icons/icons.js";

export default function Component_code_viewer_code_title($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const ctx = ComponentCodeViewerContext.get();
		const file = $.derived(() => ctx.highlightedFiles?.find((f) => f.target === ctx.activeFile) ?? null);
		const language = $.derived(() => file()?.target?.split(".").pop() ?? "svelte");
		const Icon = $.derived(() => getIconForLanguageExtension(language()));
		const showFileTree = $.derived(() => ctx.allowSidebar !== false);
		const hideSidebar = $.derived(() => ctx.allowSidebar === false);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (file()) {
				$$renderer.push('<!--[0-->');

				if (hideSidebar()) {
					$$renderer.push('<!--[0-->');

					var bind_get = () => ctx.activeFile ?? "";
					var bind_set = (v) => ctx.activeFile = v;

					$$renderer.push(`<div class="flex h-12 shrink-0 items-center gap-2 border-b px-2 py-2 text-code-foreground select-none [&amp;_svg]:size-4 [&amp;_svg]:text-code-foreground [&amp;_svg]:opacity-70"${$.attr('data-language', language())}>`);

					if (Select.Root) {
						$$renderer.push('<!--[-->');

						Select.Root($$renderer, {
							type: 'single',
							get value() {
								return bind_get();
							},

							set value($$value) {
								bind_set($$value);
							},

							children: ($$renderer) => {
								if (Select.Trigger) {
									$$renderer.push('<!--[-->');

									Select.Trigger($$renderer, {
										class: 'w-76 justify-start [&>svg]:ms-auto',
										children: ($$renderer) => {
											if (Icon()) {
												$$renderer.push('<!--[-->');
												Icon()($$renderer, { class: '!ms-0' });
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` ${$.escape(file().target.split("/").pop())}`);
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
											if (ctx.tree) {
												$$renderer.push('<!--[0-->');

												const tree = ctx.tree[0];

												if (tree && tree.children) {
													$$renderer.push(`<!--[0--><!--[-->`);

													const each_array = $.ensure_array_like(tree.children);

													for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
														let file = each_array[$$index];

														if (Select.Item) {
															$$renderer.push('<!--[-->');

															Select.Item($$renderer, {
																value: file.path ?? "",
																children: ($$renderer) => {
																	$$renderer.push(`<!---->${$.escape(file.name)}`);
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
												} else {
													$$renderer.push('<!--[-1-->');
												}

												$$renderer.push(`<!--]-->`);
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
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` <div class="ms-auto flex items-center gap-2">`);
					ComponentCodeViewerCopyCodeButton($$renderer, {});
					$$renderer.push(`<!----></div></div>`);
				} else {
					$$renderer.push(`<!--[-1--><figcaption class="hidden h-12 shrink-0 items-center gap-2 border-b px-4 py-2 text-code-foreground select-none md:flex [&amp;_svg]:size-4 [&amp;_svg]:text-code-foreground [&amp;_svg]:opacity-70"${$.attr('data-language', language())}>`);

					if (Icon()) {
						$$renderer.push('<!--[-->');
						Icon()($$renderer, {});
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` ${$.escape(file().target.split("/").pop())} <div class="ms-auto flex items-center gap-2">`);
					ComponentCodeViewerCopyCodeButton($$renderer, {});
					$$renderer.push(`<!----></div></figcaption> `);

					if (showFileTree()) {
						$$renderer.push('<!--[0-->');

						var bind_get_1 = () => ctx.activeFile ?? "";
						var bind_set_1 = (v) => ctx.activeFile = v;

						$$renderer.push(`<div class="flex h-12 shrink-0 items-center gap-2 border-b px-2 py-2 text-code-foreground md:hidden [&amp;_svg]:size-4 [&amp;_svg]:text-code-foreground [&amp;_svg]:opacity-70">`);

						if (Select.Root) {
							$$renderer.push('<!--[-->');

							Select.Root($$renderer, {
								type: 'single',
								get value() {
									return bind_get_1();
								},

								set value($$value) {
									bind_set_1($$value);
								},

								children: ($$renderer) => {
									if (Select.Trigger) {
										$$renderer.push('<!--[-->');

										Select.Trigger($$renderer, {
											class: 'w-76 justify-start [&>svg]:ms-auto',
											children: ($$renderer) => {
												if (Icon()) {
													$$renderer.push('<!--[-->');
													Icon()($$renderer, { class: '!ms-0' });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` ${$.escape(file().target.split("/").pop())}`);
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
												if (ctx.tree) {
													$$renderer.push('<!--[0-->');

													const tree = ctx.tree[0];

													if (tree && tree.children) {
														$$renderer.push(`<!--[0--><!--[-->`);

														const each_array_1 = $.ensure_array_like(tree.children);

														for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
															let file = each_array_1[$$index_1];

															if (Select.Item) {
																$$renderer.push('<!--[-->');

																Select.Item($$renderer, {
																	value: file.path ?? "",
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->${$.escape(file.name)}`);
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
													} else {
														$$renderer.push('<!--[-1-->');
													}

													$$renderer.push(`<!--]-->`);
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
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` <div class="ms-auto flex items-center gap-2">`);
						ComponentCodeViewerCopyCodeButton($$renderer, { class: 'me-0' });
						$$renderer.push(`<!----></div></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}
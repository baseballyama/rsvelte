import * as $ from 'svelte/internal/server';
import * as Sidebar from '$lib/components/ui/sidebar/index.js';
import { page } from '$app/state';
import { resolve } from '$app/paths';
import { getKeyboardShortcut } from '$lib/edra/utils.js';
import { ArrowLeft, Search } from '@lucide/svelte';
import { openSearch } from './docs/Search.svelte';
import { Button } from '../ui/button/index.ts';

export default function AppSidebar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { ref = null, $$slots, $$events, ...restProps } = $$props;

		const data = {
			navMain: [
				{
					title: 'Getting Started',
					items: [
						{ title: 'Introduction', url: resolve('/docs') },
						{ title: 'Installation', url: resolve('/docs/installation') },
						{ title: 'Configuration', url: resolve('/docs/configuration') },
						{ title: 'Usages', url: resolve('/docs/usages') },
						{
							title: 'Data & Serialization',
							url: resolve('/docs/usages/serialization')
						}
					]
				},

				{
					title: 'Extensions & Plugins',
					items: [
						{
							title: 'Starter Kit',
							url: resolve('/docs/extensions/starter-kit')
						},
						{ title: 'Tables', url: resolve('/docs/extensions/tables') },
						{ title: 'Task List', url: resolve('/docs/extensions/tasks') },
						{
							title: 'Table of Contents',
							url: resolve('/docs/extensions/table-of-contents')
						},

						{
							title: 'Typography & Colors',
							url: resolve('/docs/extensions/typography-and-colors')
						},

						{
							title: 'Mathematics',
							url: resolve('/docs/extensions/mathematics')
						},
						{ title: 'Markdown', url: resolve('/docs/extensions/markdown') },
						{
							title: 'Media & Mermaid',
							url: resolve('/docs/extensions/media-and-mermaid')
						},
						{ title: 'Callouts', url: resolve('/docs/extensions/callout') },
						{
							title: 'Drag Handle',
							url: resolve('/docs/extensions/drag-handle')
						},

						{
							title: 'Codeblock',
							url: resolve('/docs/extensions/code-block')
						},
						{ title: 'AI Assistant', url: resolve('/docs/extensions/ai') },
						{
							title: 'Slash Command',
							url: resolve('/docs/extensions/slash-command')
						},

						{
							title: 'Realtime Collaboration',
							url: resolve('/docs/collaboration')
						}
					]
				},

				{
					title: 'Customization',
					items: [
						{
							title: 'Customizing Extensions',
							url: resolve('/docs/customization')
						},

						{
							title: 'Typography & Styling',
							url: resolve('/docs/customization/styling')
						},

						{
							title: 'Localization & Strings',
							url: resolve('/docs/customization/localization')
						}
					]
				}
			]
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Sidebar.Root) {
				$$renderer.push('<!--[-->');

				Sidebar.Root($$renderer, $.spread_props([
					restProps,
					{
						get ref() {
							return ref;
						},

						set ref($$value) {
							ref = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							if (Sidebar.Header) {
								$$renderer.push('<!--[-->');

								Sidebar.Header($$renderer, {
									class: 'mt-2',
									children: ($$renderer) => {
										Button($$renderer, {
											variant: 'ghost',
											class: 'nodefault justify-start',
											href: resolve('/'),
											children: ($$renderer) => {
												ArrowLeft($$renderer, {});
												$$renderer.push(`<!----> <span>Edra</span>`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										if (Sidebar.Menu) {
											$$renderer.push('<!--[-->');

											Sidebar.Menu($$renderer, {
												children: ($$renderer) => {
													if (Sidebar.MenuItem) {
														$$renderer.push('<!--[-->');

														Sidebar.MenuItem($$renderer, {
															children: ($$renderer) => {
																if (Sidebar.MenuButton) {
																	$$renderer.push('<!--[-->');

																	Sidebar.MenuButton($$renderer, {
																		class: 'rounded-lg border',
																		onclick: openSearch,
																		children: ($$renderer) => {
																			Search($$renderer, {});
																			$$renderer.push(`<!----> <span>Search Document</span> <span class="ml-auto rounded bg-muted px-1 text-sm">${$.escape(getKeyboardShortcut('K', true))}</span>`);
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

							if (Sidebar.Content) {
								$$renderer.push('<!--[-->');

								Sidebar.Content($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!--[-->`);

										const each_array = $.ensure_array_like(data.navMain);

										for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
											let group = each_array[$$index_1];

											if (Sidebar.Group) {
												$$renderer.push('<!--[-->');

												Sidebar.Group($$renderer, {
													children: ($$renderer) => {
														if (Sidebar.GroupLabel) {
															$$renderer.push('<!--[-->');

															Sidebar.GroupLabel($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->${$.escape(group.title)}`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Sidebar.GroupContent) {
															$$renderer.push('<!--[-->');

															Sidebar.GroupContent($$renderer, {
																children: ($$renderer) => {
																	if (Sidebar.Menu) {
																		$$renderer.push('<!--[-->');

																		Sidebar.Menu($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!--[-->`);

																				const each_array_1 = $.ensure_array_like(group.items);

																				for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
																					let item = each_array_1[$$index];

																					if (Sidebar.MenuItem) {
																						$$renderer.push('<!--[-->');

																						Sidebar.MenuItem($$renderer, {
																							class: 'my-0.5',
																							children: ($$renderer) => {
																								const isActive = page.url.pathname === item.url;

																								{
																									function child($$renderer, { props }) {
																										$$renderer.push(`<a${$.attributes({ href: item.url, ...props })}>${$.escape(item.title)}</a>`);
																									}

																									if (Sidebar.MenuButton) {
																										$$renderer.push('<!--[-->');
																										Sidebar.MenuButton($$renderer, { isActive, child, $$slots: { child: true } });
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

							if (Sidebar.Rail) {
								$$renderer.push('<!--[-->');
								Sidebar.Rail($$renderer, {});
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						},
						$$slots: { default: true }
					}
				]));

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { ref });
	});
}
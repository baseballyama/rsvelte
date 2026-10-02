import * as $ from 'svelte/internal/server';
import * as Sidebar from '$lib/components/ui/sidebar/index.js';
import { groupedDocs } from '$lib/features/docs/docs';
import { page } from '$app/state';

export default function Docs_sidebar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { ref = null, $$slots, $$events, ...restProps } = $$props;
		const pathname = $.derived(() => page.url.pathname);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Sidebar.Root) {
				$$renderer.push('<!--[-->');

				Sidebar.Root($$renderer, $.spread_props([
					{
						class: 'sticky top-[calc(var(--header-height)+1px)] z-30 hidden h-[calc(100dvh-var(--header-height)-4rem)] overscroll-none bg-transparent lg:flex',
						collapsible: 'none'
					},
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
							if (Sidebar.Content) {
								$$renderer.push('<!--[-->');

								Sidebar.Content($$renderer, {
									class: 'no-scrollbar overflow-x-hidden px-2',
									children: ($$renderer) => {
										$$renderer.push(`<div class="from-background via-background/80 to-background/50 sticky -top-1 z-10 h-8 shrink-0 bg-linear-to-b blur-xs"></div> <!--[-->`);

										const each_array = $.ensure_array_like(Object.entries(groupedDocs));

										for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
											let [groupTitle, routes] = each_array[$$index_1];

											if (Sidebar.Group) {
												$$renderer.push('<!--[-->');

												Sidebar.Group($$renderer, {
													children: ($$renderer) => {
														if (Sidebar.GroupLabel) {
															$$renderer.push('<!--[-->');

															Sidebar.GroupLabel($$renderer, {
																class: 'text-muted-foreground font-medium',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->${$.escape(groupTitle)}`);
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
																	if (routes.length) {
																		$$renderer.push('<!--[0-->');

																		if (Sidebar.Menu) {
																			$$renderer.push('<!--[-->');

																			Sidebar.Menu($$renderer, {
																				class: 'gap-1',
																				children: ($$renderer) => {
																					$$renderer.push(`<!--[-->`);

																					const each_array_1 = $.ensure_array_like(routes);

																					for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
																						let doc = each_array_1[$$index];

																						if (Sidebar.MenuItem) {
																							$$renderer.push('<!--[-->');

																							Sidebar.MenuItem($$renderer, {
																								class: 'w-full',
																								children: ($$renderer) => {
																									{
																										function child($$renderer, { props }) {
																											$$renderer.push(`<a${$.attributes({ href: doc.href, ...props })}><span class="absolute inset-0 flex w-(--sidebar-width) bg-transparent"></span> ${$.escape(doc.title)} `);

																											if (doc.indicator === 'new') {
																												$$renderer.push(`<!--[0--><span class="bg-brand flex size-2 rounded-full" title="New"></span>`);
																											} else {
																												$$renderer.push('<!--[-1-->');
																											}

																											$$renderer.push(`<!--]--></a>`);
																										}

																										if (Sidebar.MenuButton) {
																											$$renderer.push('<!--[-->');

																											Sidebar.MenuButton($$renderer, {
																												isActive: doc.href === pathname(),
																												class: 'data-[active=true]:bg-accent data-[active=true]:border-accent 3xl:fixed:w-full 3xl:fixed:max-w-48 relative h-[30px] w-fit overflow-clip border border-transparent text-[0.8rem] font-medium after:absolute after:inset-x-0 after:-inset-y-1 after:z-0 after:rounded-md',
																												child,
																												$$slots: { child: true }
																											});

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
										}

										$$renderer.push(`<!--]--> <div class="from-background via-background/80 to-background/50 sticky -bottom-1 z-10 h-16 shrink-0 bg-linear-to-t blur-xs"></div>`);
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
import * as $ from 'svelte/internal/server';
import * as Drawer from "$lib/registry/ui/drawer/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Drawer_with_sides($$renderer) {
	const DRAWER_SIDES = ["top", "right", "bottom", "left"];

	Example($$renderer, {
		title: 'Sides',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex flex-wrap gap-2"><!--[-->`);

			const each_array = $.ensure_array_like(DRAWER_SIDES);

			for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
				let side = each_array[$$index_1];

				if (Drawer.Root) {
					$$renderer.push('<!--[-->');

					Drawer.Root($$renderer, {
						direction: side === "bottom" ? undefined : side,
						children: ($$renderer) => {
							{
								function child($$renderer, { props }) {
									Button($$renderer, $.spread_props([
										{ variant: 'outline', class: 'capitalize' },
										props,
										{
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(side)}`);
											},
											$$slots: { default: true }
										}
									]));
								}

								if (Drawer.Trigger) {
									$$renderer.push('<!--[-->');
									Drawer.Trigger($$renderer, { child, $$slots: { child: true } });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							}

							$$renderer.push(` `);

							if (Drawer.Content) {
								$$renderer.push('<!--[-->');

								Drawer.Content($$renderer, {
									class: 'data-[vaul-drawer-direction=bottom]:max-h-[50vh] data-[vaul-drawer-direction=top]:max-h-[50vh]',
									children: ($$renderer) => {
										if (Drawer.Header) {
											$$renderer.push('<!--[-->');

											Drawer.Header($$renderer, {
												children: ($$renderer) => {
													if (Drawer.Title) {
														$$renderer.push('<!--[-->');

														Drawer.Title($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Move Goal`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Drawer.Description) {
														$$renderer.push('<!--[-->');

														Drawer.Description($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Set your daily activity goal.`);
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

										$$renderer.push(` <div class="no-scrollbar overflow-y-auto px-4"><!--[-->`);

										const each_array_1 = $.ensure_array_like(Array.from({ length: 10 }));

										for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
											let _ = each_array_1[i];

											$$renderer.push(`<p class="mb-4 leading-normal style-lyra:mb-2 style-lyra:leading-relaxed">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
								incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
								exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute
								irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
								pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
								deserunt mollit anim id est laborum.</p>`);
										}

										$$renderer.push(`<!--]--></div> `);

										if (Drawer.Footer) {
											$$renderer.push('<!--[-->');

											Drawer.Footer($$renderer, {
												children: ($$renderer) => {
													Button($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Submit`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----> `);

													{
														function child($$renderer, { props }) {
															Button($$renderer, $.spread_props([
																{ variant: 'outline' },
																props,
																{
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Cancel`);
																	},
																	$$slots: { default: true }
																}
															]));
														}

														if (Drawer.Close) {
															$$renderer.push('<!--[-->');
															Drawer.Close($$renderer, { child, $$slots: { child: true } });
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

			$$renderer.push(`<!--]--></div>`);
		},
		$$slots: { default: true }
	});
}
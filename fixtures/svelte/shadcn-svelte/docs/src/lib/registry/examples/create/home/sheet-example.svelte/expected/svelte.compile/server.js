import * as $ from 'svelte/internal/server';
import * as Sheet from "$lib/registry/ui/sheet/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Sheet_example($$renderer) {
	const SHEET_SIDES = ["top", "right", "bottom", "left"];

	Example($$renderer, {
		title: 'Sheet',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex gap-2"><!--[-->`);

			const each_array = $.ensure_array_like(SHEET_SIDES);

			for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
				let side = each_array[$$index_1];

				if (Sheet.Root) {
					$$renderer.push('<!--[-->');

					Sheet.Root($$renderer, {
						children: ($$renderer) => {
							{
								function child($$renderer, { props }) {
									Button($$renderer, $.spread_props([
										{ variant: 'secondary', class: 'flex-1 capitalize' },
										props,
										{
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(side)}`);
											},
											$$slots: { default: true }
										}
									]));
								}

								if (Sheet.Trigger) {
									$$renderer.push('<!--[-->');
									Sheet.Trigger($$renderer, { child, $$slots: { child: true } });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							}

							$$renderer.push(` `);

							if (Sheet.Content) {
								$$renderer.push('<!--[-->');

								Sheet.Content($$renderer, {
									side,
									class: 'data-[side=bottom]:max-h-[50vh] data-[side=top]:max-h-[50vh]',
									children: ($$renderer) => {
										if (Sheet.Header) {
											$$renderer.push('<!--[-->');

											Sheet.Header($$renderer, {
												children: ($$renderer) => {
													if (Sheet.Title) {
														$$renderer.push('<!--[-->');

														Sheet.Title($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Edit profile`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Sheet.Description) {
														$$renderer.push('<!--[-->');

														Sheet.Description($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Make changes to your profile here. Click save when you're done.`);
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

										$$renderer.push(` <div class="overflow-y-auto px-4 text-sm"><!--[-->`);

										const each_array_1 = $.ensure_array_like(Array.from({ length: 10 }));

										for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
											let _ = each_array_1[index];

											$$renderer.push(`<p class="mb-4 leading-normal style-lyra:mb-2 style-lyra:leading-relaxed">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
								incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
								exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute
								irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
								pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
								deserunt mollit anim id est laborum.</p>`);
										}

										$$renderer.push(`<!--]--></div> `);

										if (Sheet.Footer) {
											$$renderer.push('<!--[-->');

											Sheet.Footer($$renderer, {
												children: ($$renderer) => {
													Button($$renderer, {
														type: 'submit',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Save changes`);
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

														if (Sheet.Close) {
															$$renderer.push('<!--[-->');
															Sheet.Close($$renderer, { child, $$slots: { child: true } });
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
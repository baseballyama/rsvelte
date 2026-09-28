import * as $ from 'svelte/internal/server';
import * as Sheet from "$lib/registry/ui/sheet/index.js";
import { buttonVariants } from "$lib/registry/ui/button/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Sheet_side($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const SHEET_SIDES = ["top", "right", "bottom", "left"];

		$$renderer.push(`<div class="grid grid-cols-2 gap-2"><!--[-->`);

		const each_array = $.ensure_array_like(SHEET_SIDES);

		for (let _ = 0, $$length = each_array.length; _ < $$length; _++) {
			let side = each_array[_];

			if (Sheet.Root) {
				$$renderer.push('<!--[-->');

				Sheet.Root($$renderer, {
					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								Button($$renderer, $.spread_props([
									{ variant: 'outline' },
									props,
									{
										class: 'capitalize',
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

									$$renderer.push(` <div class="overflow-y-auto px-4 text-sm"><h4 class="mb-4 text-lg leading-none font-medium">Lorem Ipsum</h4> <!--[-->`);

									const each_array_1 = $.ensure_array_like({ length: 10 });

									for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
										let _ = each_array_1[index];

										$$renderer.push(`<p class="mb-4 leading-normal">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
							incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
							exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
							dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
							Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
							mollit anim id est laborum.</p>`);
									}

									$$renderer.push(`<!--]--></div> `);

									if (Sheet.Footer) {
										$$renderer.push('<!--[-->');

										Sheet.Footer($$renderer, {
											children: ($$renderer) => {
												if (Sheet.Close) {
													$$renderer.push('<!--[-->');

													Sheet.Close($$renderer, {
														class: buttonVariants({ variant: "outline" }),
														children: ($$renderer) => {
															$$renderer.push(`<!---->Save changes`);
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
		}

		$$renderer.push(`<!--]--></div>`);
	});
}
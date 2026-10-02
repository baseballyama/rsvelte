import * as $ from 'svelte/internal/server';
import Plus from "@lucide/svelte/icons/plus";
import * as Avatar from "$lib/registry/ui/avatar/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Item_group_demo($$renderer) {
	const people = [
		{
			username: "shadcn",
			avatar: "https://github.com/shadcn.png",
			email: "shadcn@vercel.com"
		},

		{
			username: "maxleiter",
			avatar: "https://github.com/maxleiter.png",
			email: "maxleiter@vercel.com"
		},

		{
			username: "evilrabbit",
			avatar: "https://github.com/evilrabbit.png",
			email: "evilrabbit@vercel.com"
		}
	];

	$$renderer.push(`<div class="flex w-full max-w-md flex-col gap-6">`);

	if (Item.Group) {
		$$renderer.push('<!--[-->');

		Item.Group($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(people);

				for (let index = 0, $$length = each_array.length; index < $$length; index++) {
					let person = each_array[index];

					if (Item.Root) {
						$$renderer.push('<!--[-->');

						Item.Root($$renderer, {
							children: ($$renderer) => {
								if (Item.Media) {
									$$renderer.push('<!--[-->');

									Item.Media($$renderer, {
										children: ($$renderer) => {
											if (Avatar.Root) {
												$$renderer.push('<!--[-->');

												Avatar.Root($$renderer, {
													children: ($$renderer) => {
														if (Avatar.Image) {
															$$renderer.push('<!--[-->');
															Avatar.Image($$renderer, { src: person.avatar, class: 'grayscale' });
															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Avatar.Fallback) {
															$$renderer.push('<!--[-->');

															Avatar.Fallback($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->${$.escape(person.username.charAt(0))}`);
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

								if (Item.Content) {
									$$renderer.push('<!--[-->');

									Item.Content($$renderer, {
										class: 'gap-1',
										children: ($$renderer) => {
											if (Item.Title) {
												$$renderer.push('<!--[-->');

												Item.Title($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->${$.escape(person.username)}`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Item.Description) {
												$$renderer.push('<!--[-->');

												Item.Description($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->${$.escape(person.email)}`);
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

								if (Item.Actions) {
									$$renderer.push('<!--[-->');

									Item.Actions($$renderer, {
										children: ($$renderer) => {
											Button($$renderer, {
												variant: 'ghost',
												size: 'icon',
												class: 'rounded-full',
												children: ($$renderer) => {
													Plus($$renderer, {});
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
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (index !== people.length - 1) {
						$$renderer.push('<!--[0-->');

						if (Item.Separator) {
							$$renderer.push('<!--[-->');
							Item.Separator($$renderer, {});
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
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

	$$renderer.push(`</div>`);
}
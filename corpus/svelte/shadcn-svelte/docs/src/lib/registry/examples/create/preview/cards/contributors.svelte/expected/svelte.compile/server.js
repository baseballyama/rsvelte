import * as $ from 'svelte/internal/server';
import * as Avatar from "$lib/registry/ui/avatar/index.js";
import * as Card from "$lib/registry/ui/card/index.js";
import { Badge } from "$lib/registry/ui/badge/index.js";

export default function Contributors($$renderer) {
	const usernames = [
		"shadcn",
		"vercel",
		"nextjs",
		"tailwindlabs",
		"typescript-lang",
		"eslint",
		"prettier",
		"babel",
		"webpack",
		"rollup",
		"parcel",
		"vite",
		"react",
		"vue",
		"angular",
		"solid"
	];

	if (Card.Root) {
		$$renderer.push('<!--[-->');

		Card.Root($$renderer, {
			class: 'max-w-sm',
			children: ($$renderer) => {
				if (Card.Header) {
					$$renderer.push('<!--[-->');

					Card.Header($$renderer, {
						children: ($$renderer) => {
							if (Card.Title) {
								$$renderer.push('<!--[-->');

								Card.Title($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Contributors `);

										Badge($$renderer, {
											variant: 'secondary',
											children: ($$renderer) => {
												$$renderer.push(`<!---->312`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
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
						children: ($$renderer) => {
							$$renderer.push(`<div class="flex flex-wrap gap-2"><!--[-->`);

							const each_array = $.ensure_array_like(usernames);

							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let username = each_array[$$index];

								if (Avatar.Root) {
									$$renderer.push('<!--[-->');

									Avatar.Root($$renderer, {
										children: ($$renderer) => {
											if (Avatar.Image) {
												$$renderer.push('<!--[-->');

												Avatar.Image($$renderer, {
													src: `https://github.com/${$.stringify(username)}.png`,
													alt: username
												});

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
														$$renderer.push(`<!---->${$.escape(username.charAt(0))}`);
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

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Card.Footer) {
					$$renderer.push('<!--[-->');

					Card.Footer($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<a href="https://github.com/huntabyte/shadcn-svelte/graphs/contributors" class="text-sm underline underline-offset-4">+ 810 contributors</a>`);
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
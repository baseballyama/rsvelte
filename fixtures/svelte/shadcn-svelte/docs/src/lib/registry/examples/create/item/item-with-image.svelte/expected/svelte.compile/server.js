import * as $ from 'svelte/internal/server';
import * as Item from "$lib/registry/ui/item/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Item_with_image($$renderer) {
	Example($$renderer, {
		title: 'ItemMedia image',
		children: ($$renderer) => {
			if (Item.Root) {
				$$renderer.push('<!--[-->');

				Item.Root($$renderer, {
					children: ($$renderer) => {
						if (Item.Media) {
							$$renderer.push('<!--[-->');

							Item.Media($$renderer, {
								variant: 'image',
								children: ($$renderer) => {
									$$renderer.push(`<img src="https://avatar.vercel.sh/Project" alt="Project"${$.attr('width', 40)}${$.attr('height', 40)} class="object-cover grayscale"/>`);
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
								children: ($$renderer) => {
									if (Item.Title) {
										$$renderer.push('<!--[-->');

										Item.Title($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Project Dashboard`);
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
												$$renderer.push(`<!---->Overview of project settings and configuration.`);
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

			if (Item.Root) {
				$$renderer.push('<!--[-->');

				Item.Root($$renderer, {
					children: ($$renderer) => {
						if (Item.Media) {
							$$renderer.push('<!--[-->');

							Item.Media($$renderer, {
								variant: 'image',
								children: ($$renderer) => {
									$$renderer.push(`<img src="https://avatar.vercel.sh/Document" alt="Document"${$.attr('width', 40)}${$.attr('height', 40)} class="object-cover grayscale"/>`);
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
								children: ($$renderer) => {
									if (Item.Title) {
										$$renderer.push('<!--[-->');

										Item.Title($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Document`);
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
												$$renderer.push(`<!---->A document with metadata displayed.`);
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
										variant: 'outline',
										size: 'sm',
										children: ($$renderer) => {
											$$renderer.push(`<!---->View`);
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

			if (Item.Root) {
				$$renderer.push('<!--[-->');

				Item.Root($$renderer, {
					children: ($$renderer) => {
						if (Item.Media) {
							$$renderer.push('<!--[-->');

							Item.Media($$renderer, {
								variant: 'image',
								children: ($$renderer) => {
									$$renderer.push(`<img src="https://avatar.vercel.sh/File" alt="File"${$.attr('width', 40)}${$.attr('height', 40)} class="object-cover grayscale"/>`);
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
								children: ($$renderer) => {
									if (Item.Title) {
										$$renderer.push('<!--[-->');

										Item.Title($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->File Attachment`);
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
												$$renderer.push(`<!---->Complete file with image, title, description, and action button.`);
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
										size: 'sm',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Download`);
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
		},
		$$slots: { default: true }
	});
}
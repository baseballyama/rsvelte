import * as $ from 'svelte/internal/server';
import * as Item from "$lib/registry/ui/item/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Item_header_and_footer($$renderer) {
	Example($$renderer, {
		title: 'ItemHeader + ItemFooter',
		children: ($$renderer) => {
			if (Item.Root) {
				$$renderer.push('<!--[-->');

				Item.Root($$renderer, {
					children: ($$renderer) => {
						if (Item.Header) {
							$$renderer.push('<!--[-->');

							Item.Header($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<span class="text-sm font-medium">Team Project</span>`);
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
												$$renderer.push(`<!---->Website Redesign`);
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
												$$renderer.push(`<!---->Complete overhaul of the company website with modern design principles and improved user
				experience.`);
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

						if (Item.Footer) {
							$$renderer.push('<!--[-->');

							Item.Footer($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<span class="text-sm text-muted-foreground">Updated 5 minutes ago</span>`);
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
					variant: 'outline',
					children: ($$renderer) => {
						if (Item.Header) {
							$$renderer.push('<!--[-->');

							Item.Header($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<span class="text-sm font-medium">Client Work</span>`);
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
												$$renderer.push(`<!---->Mobile App Development`);
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
												$$renderer.push(`<!---->Building a cross-platform mobile application for iOS and Android with React Native.`);
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

						if (Item.Footer) {
							$$renderer.push('<!--[-->');

							Item.Footer($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<span class="text-sm text-muted-foreground">Status: In Progress</span>`);
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
					variant: 'muted',
					children: ($$renderer) => {
						if (Item.Header) {
							$$renderer.push('<!--[-->');

							Item.Header($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<span class="text-sm font-medium">Documentation</span>`);
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
												$$renderer.push(`<!---->API Integration Guide`);
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
												$$renderer.push(`<!---->Step-by-step instructions for integrating third-party APIs with authentication and error
				handling.`);
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

						if (Item.Footer) {
							$$renderer.push('<!--[-->');

							Item.Footer($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<span class="text-sm text-muted-foreground">Category: Technical • 3 attachments</span>`);
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
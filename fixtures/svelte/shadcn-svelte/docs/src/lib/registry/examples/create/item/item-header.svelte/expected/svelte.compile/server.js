import * as $ from 'svelte/internal/server';
import * as Item from "$lib/registry/ui/item/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Item_header($$renderer) {
	Example($$renderer, {
		title: 'ItemHeader',
		children: ($$renderer) => {
			if (Item.Root) {
				$$renderer.push('<!--[-->');

				Item.Root($$renderer, {
					children: ($$renderer) => {
						if (Item.Header) {
							$$renderer.push('<!--[-->');

							Item.Header($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<span class="text-sm font-medium">Design System</span>`);
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
												$$renderer.push(`<!---->Component Library`);
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
												$$renderer.push(`<!---->A comprehensive collection of reusable UI components for building consistent interfaces.`);
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
					variant: 'outline',
					children: ($$renderer) => {
						if (Item.Header) {
							$$renderer.push('<!--[-->');

							Item.Header($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<span class="text-sm font-medium">Marketing</span>`);
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
												$$renderer.push(`<!---->Campaign Analytics`);
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
												$$renderer.push(`<!---->Track performance metrics and engagement rates across all marketing channels.`);
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
					variant: 'muted',
					children: ($$renderer) => {
						if (Item.Header) {
							$$renderer.push('<!--[-->');

							Item.Header($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<span class="text-sm font-medium">Engineering</span>`);
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
												$$renderer.push(`<!---->API Documentation`);
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
												$$renderer.push(`<!---->Complete reference guide for all available endpoints and authentication methods.`);
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
}
import * as $ from 'svelte/internal/server';
import * as Item from "$lib/registry/ui/item/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Item_group($$renderer) {
	Example($$renderer, {
		title: 'ItemGroup',
		children: ($$renderer) => {
			if (Item.Group) {
				$$renderer.push('<!--[-->');

				Item.Group($$renderer, {
					children: ($$renderer) => {
						if (Item.Root) {
							$$renderer.push('<!--[-->');

							Item.Root($$renderer, {
								children: ($$renderer) => {
									if (Item.Content) {
										$$renderer.push('<!--[-->');

										Item.Content($$renderer, {
											children: ($$renderer) => {
												if (Item.Title) {
													$$renderer.push('<!--[-->');

													Item.Title($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Item 1`);
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
															$$renderer.push(`<!---->First item in the group.`);
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
									if (Item.Content) {
										$$renderer.push('<!--[-->');

										Item.Content($$renderer, {
											children: ($$renderer) => {
												if (Item.Title) {
													$$renderer.push('<!--[-->');

													Item.Title($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Item 2`);
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
															$$renderer.push(`<!---->Second item in the group.`);
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
									if (Item.Content) {
										$$renderer.push('<!--[-->');

										Item.Content($$renderer, {
											children: ($$renderer) => {
												if (Item.Title) {
													$$renderer.push('<!--[-->');

													Item.Title($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Item 3`);
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
															$$renderer.push(`<!---->Third item in the group.`);
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
		},
		$$slots: { default: true }
	});
}
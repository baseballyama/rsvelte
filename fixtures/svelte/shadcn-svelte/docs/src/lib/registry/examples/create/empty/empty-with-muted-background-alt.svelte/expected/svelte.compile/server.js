import * as $ from 'svelte/internal/server';
import * as Empty from "$lib/registry/ui/empty/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import * as Kbd from "$lib/registry/ui/kbd/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Empty_with_muted_background_alt($$renderer) {
	Example($$renderer, {
		title: 'With Muted Background Alt',
		children: ($$renderer) => {
			if (Empty.Root) {
				$$renderer.push('<!--[-->');

				Empty.Root($$renderer, {
					class: 'bg-muted/50',
					children: ($$renderer) => {
						if (Empty.Header) {
							$$renderer.push('<!--[-->');

							Empty.Header($$renderer, {
								children: ($$renderer) => {
									if (Empty.Title) {
										$$renderer.push('<!--[-->');

										Empty.Title($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->404 - Not Found`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Empty.Description) {
										$$renderer.push('<!--[-->');

										Empty.Description($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->The page you're looking for doesn't exist. Try searching for what you need below.`);
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

						if (Empty.Content) {
							$$renderer.push('<!--[-->');

							Empty.Content($$renderer, {
								children: ($$renderer) => {
									if (InputGroup.Root) {
										$$renderer.push('<!--[-->');

										InputGroup.Root($$renderer, {
											class: 'w-3/4',
											children: ($$renderer) => {
												if (InputGroup.Input) {
													$$renderer.push('<!--[-->');
													InputGroup.Input($$renderer, { placeholder: 'Try searching for pages...' });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (InputGroup.Addon) {
													$$renderer.push('<!--[-->');

													InputGroup.Addon($$renderer, {
														children: ($$renderer) => {
															IconPlaceholder($$renderer, {
																lucide: 'CircleDashedIcon',
																tabler: 'IconCircleDashed',
																hugeicons: 'DashedLineCircleIcon',
																phosphor: 'CircleDashedIcon',
																remixicon: 'RiLoaderLine'
															});
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (InputGroup.Addon) {
													$$renderer.push('<!--[-->');

													InputGroup.Addon($$renderer, {
														align: 'inline-end',
														children: ($$renderer) => {
															if (Kbd.Root) {
																$$renderer.push('<!--[-->');

																Kbd.Root($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->/`);
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

									if (Empty.Description) {
										$$renderer.push('<!--[-->');

										Empty.Description($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Need help? <a href="#/">Contact support</a>`);
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
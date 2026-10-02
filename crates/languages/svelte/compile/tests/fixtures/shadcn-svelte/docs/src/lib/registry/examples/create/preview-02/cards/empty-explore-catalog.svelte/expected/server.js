import * as $ from 'svelte/internal/server';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Empty from "$lib/registry/ui/empty/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Empty_explore_catalog($$renderer) {
	if (Card.Root) {
		$$renderer.push('<!--[-->');

		Card.Root($$renderer, {
			children: ($$renderer) => {
				if (Card.Content) {
					$$renderer.push('<!--[-->');

					Card.Content($$renderer, {
						children: ($$renderer) => {
							if (Empty.Root) {
								$$renderer.push('<!--[-->');

								Empty.Root($$renderer, {
									class: 'p-4',
									children: ($$renderer) => {
										if (Empty.Media) {
											$$renderer.push('<!--[-->');

											Empty.Media($$renderer, {
												variant: 'icon',
												children: ($$renderer) => {
													IconPlaceholder($$renderer, {
														lucide: 'AudioLinesIcon',
														tabler: 'IconPlayerRecordFilled',
														hugeicons: 'AudioWave01Icon',
														phosphor: 'RecordIcon',
														remixicon: 'RiRecordCircleLine'
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

										if (Empty.Header) {
											$$renderer.push('<!--[-->');

											Empty.Header($$renderer, {
												children: ($$renderer) => {
													if (Empty.Title) {
														$$renderer.push('<!--[-->');

														Empty.Title($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Explore Catalog`);
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
																$$renderer.push(`<!---->Check your ISRC codes, metadata, and visual assets before going live.`);
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
													Button($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->View Catalog`);
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
import * as $ from 'svelte/internal/server';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Empty from "$lib/registry/ui/empty/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";

export default function File_upload($$renderer) {
	if (Card.Root) {
		$$renderer.push('<!--[-->');

		Card.Root($$renderer, {
			children: ($$renderer) => {
				if (Card.Header) {
					$$renderer.push('<!--[-->');

					Card.Header($$renderer, {
						children: ($$renderer) => {
							if (Card.Title) {
								$$renderer.push('<!--[-->');

								Card.Title($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->File Upload`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Card.Description) {
								$$renderer.push('<!--[-->');

								Card.Description($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Drag and drop or browse`);
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
							if (Empty.Root) {
								$$renderer.push('<!--[-->');

								Empty.Root($$renderer, {
									class: 'border',
									children: ($$renderer) => {
										if (Empty.Header) {
											$$renderer.push('<!--[-->');

											Empty.Header($$renderer, {
												children: ($$renderer) => {
													if (Empty.Media) {
														$$renderer.push('<!--[-->');

														Empty.Media($$renderer, {
															variant: 'icon',
															children: ($$renderer) => {
																IconPlaceholder($$renderer, {
																	lucide: 'UploadCloudIcon',
																	tabler: 'IconCloudUpload',
																	hugeicons: 'CloudUploadIcon',
																	phosphor: 'CloudArrowUpIcon',
																	remixicon: 'RiUploadCloudLine'
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

													if (Empty.Title) {
														$$renderer.push('<!--[-->');

														Empty.Title($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Upload files`);
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
																$$renderer.push(`<!---->PNG, JPG, PDF up to 10MB`);
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
															$$renderer.push(`<!---->Browse Files`);
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
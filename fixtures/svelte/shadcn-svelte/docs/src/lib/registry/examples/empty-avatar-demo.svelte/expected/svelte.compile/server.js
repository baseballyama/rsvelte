import * as $ from 'svelte/internal/server';
import * as Avatar from "$lib/registry/ui/avatar/index.js";
import * as Empty from "$lib/registry/ui/empty/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Empty_avatar_demo($$renderer) {
	if (Empty.Root) {
		$$renderer.push('<!--[-->');

		Empty.Root($$renderer, {
			children: ($$renderer) => {
				if (Empty.Header) {
					$$renderer.push('<!--[-->');

					Empty.Header($$renderer, {
						children: ($$renderer) => {
							if (Empty.Media) {
								$$renderer.push('<!--[-->');

								Empty.Media($$renderer, {
									variant: 'default',
									children: ($$renderer) => {
										if (Avatar.Root) {
											$$renderer.push('<!--[-->');

											Avatar.Root($$renderer, {
												class: 'size-12',
												children: ($$renderer) => {
													if (Avatar.Image) {
														$$renderer.push('<!--[-->');
														Avatar.Image($$renderer, { src: 'https://github.com/shadcn.png', class: 'grayscale' });
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
																$$renderer.push(`<!---->LR`);
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

							if (Empty.Title) {
								$$renderer.push('<!--[-->');

								Empty.Title($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->User Offline`);
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
										$$renderer.push(`<!---->This user is currently offline. You can leave a message to notify them or try again later.`);
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
								size: 'sm',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Leave Message`);
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
}
import * as $ from 'svelte/internal/server';
import * as Empty from "$lib/registry/ui/empty/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Empty_with_icon($$renderer) {
	Example($$renderer, {
		title: 'With Icon',
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
													lucide: 'FolderIcon',
													tabler: 'IconFolder',
													hugeicons: 'Folder01Icon',
													phosphor: 'FolderIcon',
													remixicon: 'RiFolderLine'
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
												$$renderer.push(`<!---->Nothing to see here`);
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
												$$renderer.push(`<!---->No posts have been created yet. Get started by <a href="#/">creating your first post</a>.`);
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
										variant: 'outline',
										children: ($$renderer) => {
											IconPlaceholder($$renderer, {
												lucide: 'PlusIcon',
												tabler: 'IconPlus',
												hugeicons: 'PlusSignIcon',
												phosphor: 'PlusIcon',
												remixicon: 'RiAddLine',
												'data-icon': 'inline-start'
											});

											$$renderer.push(`<!----> New Post`);
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
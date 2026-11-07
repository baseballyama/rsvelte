import * as $ from 'svelte/internal/server';
import * as Empty from "$lib/registry/ui/empty/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Empty_in_card($$renderer) {
	Example($$renderer, {
		title: 'In Card',
		children: ($$renderer) => {
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
												$$renderer.push(`<!---->No projects yet`);
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
												$$renderer.push(`<!---->You haven't created any projects yet. Get started by creating your first project.`);
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
									$$renderer.push(`<div class="flex gap-2">`);

									Button($$renderer, {
										href: '#/',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Create project`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Button($$renderer, {
										variant: 'outline',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Import project`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----></div> `);

									Button($$renderer, {
										variant: 'link',
										href: '#/',
										class: 'text-muted-foreground',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Learn more `);

											IconPlaceholder($$renderer, {
												lucide: 'ArrowUpRightIcon',
												tabler: 'IconArrowUpRight',
												hugeicons: 'ArrowUpRight01Icon',
												phosphor: 'ArrowUpRightIcon',
												remixicon: 'RiArrowRightUpLine'
											});

											$$renderer.push(`<!---->`);
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
		},
		$$slots: { default: true }
	});
}
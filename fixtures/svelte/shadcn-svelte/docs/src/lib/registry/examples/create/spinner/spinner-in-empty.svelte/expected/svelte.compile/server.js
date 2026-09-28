import * as $ from 'svelte/internal/server';
import * as Empty from "$lib/registry/ui/empty/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { Spinner } from "$lib/registry/ui/spinner/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Spinner_in_empty($$renderer) {
	Example($$renderer, {
		title: 'In Empty State',
		containerClass: 'lg:col-span-full',
		children: ($$renderer) => {
			if (Empty.Root) {
				$$renderer.push('<!--[-->');

				Empty.Root($$renderer, {
					class: 'min-h-[300px]',
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
												Spinner($$renderer, {});
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
												lucide: 'ArrowRightIcon',
												tabler: 'IconArrowRight',
												hugeicons: 'ArrowRight02Icon',
												phosphor: 'ArrowRightIcon',
												remixicon: 'RiArrowRightLine'
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
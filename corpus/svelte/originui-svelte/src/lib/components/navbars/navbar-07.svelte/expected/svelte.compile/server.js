import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import ChevronUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
import { Logo, NotificationMenu, UserMenu } from '$lib/components/_extras/navbars';

import {
	Breadcrumb,
	BreadcrumbEllipsis,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator
} from '$lib/components/ui/breadcrumb';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '$lib/components/ui/dropdowns';

import { Select, SelectContent, SelectItem } from '$lib/components/ui/select';
import { Select as SelectPrimitive } from 'bits-ui';

export default function Navbar_07($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const projects = [
			{ label: 'Main project', value: '1' },
			{ label: 'Origin-Svelte project', value: '2' }
		];

		let selectedProject = projects[0].value;

		$$renderer.push(`<header class="border-b px-4 md:px-6"><div class="flex h-16 items-center justify-between gap-4"><div class="flex items-center gap-2">`);

		Breadcrumb($$renderer, {
			children: ($$renderer) => {
				BreadcrumbList($$renderer, {
					children: ($$renderer) => {
						BreadcrumbItem($$renderer, {
							children: ($$renderer) => {
								BreadcrumbLink($$renderer, {
									href: '#',
									class: 'text-foreground',
									children: ($$renderer) => {
										Logo($$renderer, {});
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						BreadcrumbSeparator($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->/`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						BreadcrumbItem($$renderer, {
							class: 'md:hidden',
							children: ($$renderer) => {
								DropdownMenu($$renderer, {
									children: ($$renderer) => {
										DropdownMenuTrigger($$renderer, {
											class: 'hover:text-foreground',
											children: ($$renderer) => {
												BreadcrumbEllipsis($$renderer, {});
												$$renderer.push(`<!----> <span class="sr-only">Toggle menu</span>`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										DropdownMenuContent($$renderer, {
											align: 'start',
											children: ($$renderer) => {
												{
													function child($$renderer, { props }) {
														$$renderer.push(`<a${$.attributes({ href: '#', ...props })}>Personal Account</a>`);
													}

													DropdownMenuItem($$renderer, { child, $$slots: { child: true } });
												}

												$$renderer.push(`<!----> `);

												{
													function child($$renderer, { props }) {
														$$renderer.push(`<a${$.attributes({ href: '#', ...props })}>Projects</a>`);
													}

													DropdownMenuItem($$renderer, { child, $$slots: { child: true } });
												}

												$$renderer.push(`<!---->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						BreadcrumbItem($$renderer, {
							class: 'max-md:hidden',
							children: ($$renderer) => {
								BreadcrumbLink($$renderer, {
									href: '#',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Personal Account`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						BreadcrumbSeparator($$renderer, {
							class: 'max-md:hidden',
							children: ($$renderer) => {
								$$renderer.push(`<!---->/`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						BreadcrumbItem($$renderer, {
							class: 'max-md:hidden',
							children: ($$renderer) => {
								BreadcrumbLink($$renderer, {
									href: '#',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Projects`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						BreadcrumbSeparator($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->/`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						BreadcrumbItem($$renderer, {
							children: ($$renderer) => {
								Select($$renderer, {
									type: 'single',
									onValueChange: (value) => selectedProject = value,
									items: projects,
									children: ($$renderer) => {
										{
											function child($$renderer, { props }) {
												Button($$renderer, $.spread_props([
													{
														variant: 'ghost',
														class: 'text-foreground focus-visible:bg-accent h-8 px-1.5 focus-visible:ring-0'
													},
													props,
													{
														children: ($$renderer) => {
															$$renderer.push(`<span>`);

															if (selectedProject) {
																$$renderer.push(`<!--[0-->${$.escape(projects.find((p) => p.value === selectedProject)?.label || 'Select project')}`);
															} else {
																$$renderer.push('<!--[-1-->');
															}

															$$renderer.push(`<!--]--></span> `);
															ChevronUpDownIcon($$renderer, { size: 14, class: 'text-muted-foreground/80' });
															$$renderer.push(`<!---->`);
														},
														$$slots: { default: true }
													}
												]));
											}

											if (SelectPrimitive.Trigger) {
												$$renderer.push('<!--[-->');

												SelectPrimitive.Trigger($$renderer, {
													'aria-label': 'Select project',
													child,
													$$slots: { child: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										}

										$$renderer.push(` `);

										SelectContent($$renderer, {
											class: '[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2',
											children: ($$renderer) => {
												$$renderer.push(`<!--[-->`);

												const each_array = $.ensure_array_like(projects);

												for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
													let { label, value } = each_array[$$index];

													SelectItem($$renderer, {
														value,
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(label)}`);
														},
														$$slots: { default: true }
													});
												}

												$$renderer.push(`<!--]-->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="flex items-center gap-4">`);
		NotificationMenu($$renderer, {});
		$$renderer.push(`<!----> `);
		UserMenu($$renderer, {});
		$$renderer.push(`<!----></div></div></header>`);
	});
}
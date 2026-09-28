import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import ChevronUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
import { SettingsMenu, UserMenu } from '$lib/components/_extras/navbars';

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbSeparator
} from '$lib/components/ui/breadcrumb';

import {
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuRoot
} from '$lib/components/ui/navigation-menu';

import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';
import { Select, SelectContent, SelectItem } from '$lib/components/ui/select';
import { Select as SelectPrimitive } from 'bits-ui';

export default function Navbar_13($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const navigationLinks = [
			{ href: '#', label: 'Dashboard' },
			{ href: '#', label: 'Docs' },
			{ href: '#', label: 'API reference' }
		];

		const accountTypes = [
			{ label: 'Personal', value: 'personal' },
			{ label: 'Team', value: 'team' },
			{ label: 'Business', value: 'business' }
		];

		let selectedAccountType = accountTypes[0].value;

		const projects = [
			{ label: 'Main project', value: '1' },
			{ label: 'Origin-Svelte project', value: '2' }
		];

		let selectedProject = projects[0].value;

		$$renderer.push(`<header class="border-b px-4 md:px-6"><div class="flex h-16 items-center justify-between gap-4"><div class="flex items-center gap-2">`);

		Popover($$renderer, {
			children: ($$renderer) => {
				{
					function child($$renderer, { props }) {
						Button($$renderer, $.spread_props([
							{
								class: 'group size-8 md:hidden',
								variant: 'ghost',
								size: 'icon'
							},
							props,
							{
								children: ($$renderer) => {
									$$renderer.push(`<svg class="pointer-events-none"${$.attr('width', 16)}${$.attr('height', 16)} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M4 12L20 12" class="origin-center -translate-y-[7px] transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-315"></path><path d="M4 12H20" class="origin-center transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,0.25,1.8)] group-aria-expanded:rotate-45"></path><path d="M4 12H20" class="origin-center translate-y-[7px] transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-135"></path></svg>`);
								},
								$$slots: { default: true }
							}
						]));
					}

					PopoverTrigger($$renderer, { child, $$slots: { child: true } });
				}

				$$renderer.push(`<!----> `);

				PopoverContent($$renderer, {
					align: 'start',
					class: 'w-36 p-1 md:hidden',
					children: ($$renderer) => {
						NavigationMenuRoot($$renderer, {
							class: 'max-w-none *:w-full',
							children: ($$renderer) => {
								NavigationMenuList($$renderer, {
									class: 'flex-col items-start gap-0 md:gap-2',
									children: ($$renderer) => {
										$$renderer.push(`<!--[-->`);

										const each_array = $.ensure_array_like(navigationLinks);

										for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
											let link = each_array[$$index];

											NavigationMenuItem($$renderer, {
												class: 'w-full',
												children: ($$renderer) => {
													NavigationMenuLink($$renderer, {
														href: link.href,
														class: 'py-1.5',
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(link.label)}`);
														},
														$$slots: { default: true }
													});
												},
												$$slots: { default: true }
											});
										}

										$$renderer.push(`<!--]-->`);
									},
									$$slots: { default: true }
								});
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

		$$renderer.push(`<!----> `);

		Breadcrumb($$renderer, {
			children: ($$renderer) => {
				BreadcrumbList($$renderer, {
					children: ($$renderer) => {
						BreadcrumbItem($$renderer, {
							children: ($$renderer) => {
								Select($$renderer, {
									type: 'single',
									onValueChange: (value) => {
										selectedAccountType = value;
									},
									items: accountTypes,
									children: ($$renderer) => {
										{
											function child($$renderer, { props }) {
												Button($$renderer, $.spread_props([
													{
														variant: 'ghost',
														class: 'text-foreground focus-visible:bg-accent h-8 p-1.5 focus-visible:ring-0'
													},
													props,
													{
														children: ($$renderer) => {
															$$renderer.push(`<span>`);

															if (selectedAccountType) {
																$$renderer.push(`<!--[0-->${$.escape(accountTypes.find((a) => a.value === selectedAccountType)?.label || 'Select account type')}`);
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
													'aria-label': 'Select account type',
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

												const each_array_1 = $.ensure_array_like(accountTypes);

												for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
													let accountType = each_array_1[$$index_1];

													SelectItem($$renderer, {
														value: accountType.value,
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(accountType.label)}`);
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
									onValueChange: (value) => {
										selectedProject = value;
									},
									items: projects,
									children: ($$renderer) => {
										{
											function child($$renderer, { props }) {
												Button($$renderer, $.spread_props([
													{
														variant: 'ghost',
														class: 'text-foreground focus-visible:bg-accent h-8 p-1.5 focus-visible:ring-0'
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

												const each_array_2 = $.ensure_array_like(projects);

												for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
													let project = each_array_2[$$index_2];

													SelectItem($$renderer, {
														value: project.value,
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(project.label)}`);
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

		$$renderer.push(`<!----></div> <div class="flex items-center gap-4"><div class="flex items-center gap-2">`);

		NavigationMenuRoot($$renderer, {
			class: 'max-md:hidden',
			children: ($$renderer) => {
				NavigationMenuList($$renderer, {
					class: 'gap-2',
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array_3 = $.ensure_array_like(navigationLinks);

						for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
							let link = each_array_3[$$index_3];

							NavigationMenuItem($$renderer, {
								children: ($$renderer) => {
									NavigationMenuLink($$renderer, {
										href: link.href,
										class: 'text-muted-foreground hover:text-primary py-1.5 font-medium',
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(link.label)}`);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);
		SettingsMenu($$renderer, {});
		$$renderer.push(`<!----></div> `);
		UserMenu($$renderer, {});
		$$renderer.push(`<!----></div></div></header>`);
	});
}
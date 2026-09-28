import * as $ from 'svelte/internal/server';
import Folders from '@lucide/svelte/icons/folder';

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator
} from '$lib/components/ui/breadcrumb';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '$lib/components/ui/dropdowns';

export default function Breadcrumb_02($$renderer) {
	Breadcrumb($$renderer, {
		children: ($$renderer) => {
			BreadcrumbList($$renderer, {
				children: ($$renderer) => {
					BreadcrumbItem($$renderer, {
						children: ($$renderer) => {
							BreadcrumbLink($$renderer, {
								href: '#title',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Home`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);
					BreadcrumbSeparator($$renderer, {});
					$$renderer.push(`<!----> `);

					BreadcrumbItem($$renderer, {
						children: ($$renderer) => {
							DropdownMenu($$renderer, {
								children: ($$renderer) => {
									DropdownMenuTrigger($$renderer, {
										class: 'hover:text-foreground',
										children: ($$renderer) => {
											$$renderer.push(`<span role="presentation" aria-hidden="true" class="flex size-5 items-center justify-center">`);
											Folders($$renderer, { size: 16 });
											$$renderer.push(`<!----></span>`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									DropdownMenuContent($$renderer, {
										align: 'start',
										children: ($$renderer) => {
											{
												function child($$renderer, { props }) {
													$$renderer.push(`<a${$.attributes({ href: '#title', ...props })}>Documentation</a>`);
												}

												DropdownMenuItem($$renderer, { child, $$slots: { child: true } });
											}

											$$renderer.push(`<!----> `);

											{
												function child($$renderer, { props }) {
													$$renderer.push(`<a${$.attributes({ href: '#title', ...props })}>Themes</a>`);
												}

												DropdownMenuItem($$renderer, { child, $$slots: { child: true } });
											}

											$$renderer.push(`<!----> `);

											{
												function child($$renderer, { props }) {
													$$renderer.push(`<a${$.attributes({ href: '#title', ...props })}>GitHub</a>`);
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
					BreadcrumbSeparator($$renderer, {});
					$$renderer.push(`<!----> `);

					BreadcrumbItem($$renderer, {
						children: ($$renderer) => {
							BreadcrumbLink($$renderer, {
								href: '#',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Components`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);
					BreadcrumbSeparator($$renderer, {});
					$$renderer.push(`<!----> `);

					BreadcrumbItem($$renderer, {
						children: ($$renderer) => {
							BreadcrumbPage($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Breadcrumb`);
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
}
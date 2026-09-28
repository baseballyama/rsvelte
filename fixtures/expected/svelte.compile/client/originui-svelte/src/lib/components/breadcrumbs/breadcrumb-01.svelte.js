import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Breadcrumb,
	BreadcrumbEllipsis,
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

var root = $.from_html(`<!> <span class="sr-only">Toggle menu</span>`, 1);
var root_1 = $.from_html(`<a>Documentation</a>`);
var root_2 = $.from_html(`<a>Themes</a>`);
var root_3 = $.from_html(`<a>GitHub</a>`);
var root_4 = $.from_html(`<!> <!> <!>`, 1);
var root_5 = $.from_html(`<!> <!>`, 1);
var root_6 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Breadcrumb_01($$anchor) {
	Breadcrumb($$anchor, {
		children: ($$anchor, $$slotProps) => {
			BreadcrumbList($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_6();
					var node = $.first_child(fragment_2);

					BreadcrumbItem(node, {
						children: ($$anchor, $$slotProps) => {
							BreadcrumbLink($$anchor, {
								href: '#title',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Home');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_1 = $.sibling(node, 2);

					BreadcrumbSeparator(node_1, {});

					var node_2 = $.sibling(node_1, 2);

					BreadcrumbItem(node_2, {
						children: ($$anchor, $$slotProps) => {
							DropdownMenu($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root_5();
									var node_3 = $.first_child(fragment_5);

									DropdownMenuTrigger(node_3, {
										class: 'hover:text-foreground',
										children: ($$anchor, $$slotProps) => {
											var fragment_6 = root();
											var node_4 = $.first_child(fragment_6);

											BreadcrumbEllipsis(node_4, {});
											$.next(2);
											$.append($$anchor, fragment_6);
										},
										$$slots: { default: true }
									});

									var node_5 = $.sibling(node_3, 2);

									DropdownMenuContent(node_5, {
										align: 'start',
										children: ($$anchor, $$slotProps) => {
											var fragment_7 = root_4();
											var node_6 = $.first_child(fragment_7);

											{
												const child = ($$anchor, $$arg0) => {
													let props = () => ($$arg0?.()).props;
													var a = root_1();

													$.attribute_effect(a, () => ({ href: '#title', ...props() }));
													$.append($$anchor, a);
												};

												DropdownMenuItem(node_6, { child, $$slots: { child: true } });
											}

											var node_7 = $.sibling(node_6, 2);

											{
												const child = ($$anchor, $$arg0) => {
													let props = () => ($$arg0?.()).props;
													var a_1 = root_2();

													$.attribute_effect(a_1, () => ({ href: '#title', ...props() }));
													$.append($$anchor, a_1);
												};

												DropdownMenuItem(node_7, { child, $$slots: { child: true } });
											}

											var node_8 = $.sibling(node_7, 2);

											{
												const child = ($$anchor, $$arg0) => {
													let props = () => ($$arg0?.()).props;
													var a_2 = root_3();

													$.attribute_effect(a_2, () => ({ href: '#title', ...props() }));
													$.append($$anchor, a_2);
												};

												DropdownMenuItem(node_8, { child, $$slots: { child: true } });
											}

											$.append($$anchor, fragment_7);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_9 = $.sibling(node_2, 2);

					BreadcrumbSeparator(node_9, {});

					var node_10 = $.sibling(node_9, 2);

					BreadcrumbItem(node_10, {
						children: ($$anchor, $$slotProps) => {
							BreadcrumbLink($$anchor, {
								href: '#',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Components');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_11 = $.sibling(node_10, 2);

					BreadcrumbSeparator(node_11, {});

					var node_12 = $.sibling(node_11, 2);

					BreadcrumbItem(node_12, {
						children: ($$anchor, $$slotProps) => {
							BreadcrumbPage($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Breadcrumb');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}
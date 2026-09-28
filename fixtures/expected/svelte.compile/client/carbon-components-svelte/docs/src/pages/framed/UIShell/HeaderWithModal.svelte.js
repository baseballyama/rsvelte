import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Button,
	Column,
	Content,
	Grid,
	Header,
	HeaderNav,
	HeaderNavItem,
	Modal,
	Row,
	SideNav,
	SideNavItems,
	SideNavLink,
	SideNavMenu,
	SideNavMenuItem,
	SkipToContent,
	Stack
} from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

var root_2 = $.from_html(`<p>The body scroll lock is ref-counted, so opening this modal while the side
    nav overlay is also open keeps the page locked until both are closed.</p>`);

var root_3 = $.from_html(`<h1>Clusters</h1> <!>`, 1);
var root_4 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function HeaderWithModal($$anchor) {
	let isSideNavOpen = false;
	let open = false;
	var fragment = root_4();
	var node = $.first_child(fragment);

	Header(node, {
		companyName: 'IBM',
		platformName: 'Cloud',
		get isSideNavOpen() {
			return isSideNavOpen;
		},

		set isSideNavOpen($$value) {
			isSideNavOpen = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			HeaderNav($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					HeaderNavItem(node_1, { href: '/catalog', text: 'Catalog' });

					var node_2 = $.sibling(node_1, 2);

					HeaderNavItem(node_2, { href: '/docs', text: 'Docs' });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},

		$$slots: {
			default: true,
			skipToContent: ($$anchor, $$slotProps) => {
				SkipToContent($$anchor, {});
			}
		}
	});

	var node_3 = $.sibling(node, 2);

	SideNav(node_3, {
		get isOpen() {
			return isSideNavOpen;
		},

		set isOpen($$value) {
			isSideNavOpen = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			SideNavItems($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_5 = root_1();
					var node_4 = $.first_child(fragment_5);

					SideNavLink(node_4, { href: '/dashboard', text: 'Dashboard' });

					var node_5 = $.sibling(node_4, 2);

					SideNavLink(node_5, { href: '/resources', text: 'Resource list' });

					var node_6 = $.sibling(node_5, 2);

					SideNavMenu(node_6, {
						text: 'Kubernetes',
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root();
							var node_7 = $.first_child(fragment_6);

							SideNavMenuItem(node_7, { href: '/kubernetes/clusters', text: 'Clusters' });

							var node_8 = $.sibling(node_7, 2);

							SideNavMenuItem(node_8, { href: '/kubernetes/worker-pools', text: 'Worker pools' });
							$.append($$anchor, fragment_6);
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

	var node_9 = $.sibling(node_3, 2);

	Modal(node_9, {
		modalHeading: 'Create cluster',
		primaryButtonText: 'Create',
		secondaryButtonText: 'Cancel',
		get open() {
			return open;
		},

		set open($$value) {
			open = $$value;
		},

		$$events: {
			'click:button--secondary': () => open = false,
			submit: () => open = false
		},

		children: ($$anchor, $$slotProps) => {
			var p = root_2();

			$.append($$anchor, p);
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_9, 2);

	Content(node_10, {
		children: ($$anchor, $$slotProps) => {
			Grid($$anchor, {
				children: ($$anchor, $$slotProps) => {
					Row($$anchor, {
						children: ($$anchor, $$slotProps) => {
							Column($$anchor, {
								children: ($$anchor, $$slotProps) => {
									Stack($$anchor, {
										gap: 6,
										children: ($$anchor, $$slotProps) => {
											var fragment_11 = root_3();
											var node_11 = $.sibling($.first_child(fragment_11), 2);

											Button(node_11, {
												$$events: { click: () => open = true },
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text('Create cluster');

													$.append($$anchor, text);
												},
												$$slots: { default: true }
											});

											$.append($$anchor, fragment_11);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}
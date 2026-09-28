import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Column,
	Content,
	Grid,
	Header,
	HeaderAction,
	HeaderPanelDivider,
	HeaderPanelLink,
	HeaderPanelLinks,
	HeaderUtilities,
	Row,
	SkipToContent
} from "carbon-components-svelte";

import Help from "carbon-icons-svelte/lib/Help.svelte";
import Notification from "carbon-icons-svelte/lib/Notification.svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<h1>Dashboard</h1>`);

export default function HeaderMultipleSwitcher($$anchor) {
	let isOpen1 = false;
	let isOpen2 = false;
	let isOpen3 = false;
	var fragment = root_1();
	var node = $.first_child(fragment);

	Header(node, {
		companyName: 'IBM',
		platformName: 'Cloud',
		isSideNavOpen: true,
		children: ($$anchor, $$slotProps) => {
			HeaderUtilities($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_2();
					var node_1 = $.first_child(fragment_2);

					HeaderAction(node_1, {
						iconDescription: 'Notifications',
						tooltipAlignment: 'start',
						get icon() {
							return Notification;
						},

						get isOpen() {
							return isOpen1;
						},

						set isOpen($$value) {
							isOpen1 = $$value;
						},

						$$events: {
							open: () => {
								isOpen2 = false;
								isOpen3 = false;
							}
						},

						children: ($$anchor, $$slotProps) => {
							HeaderPanelLinks($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root();
									var node_2 = $.first_child(fragment_4);

									HeaderPanelDivider(node_2, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text('Today');

											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});

									var node_3 = $.sibling(node_2, 2);

									HeaderPanelLink(node_3, {
										href: '/activity',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_1 = $.text('Cluster "mycluster-prod" was updated');

											$.append($$anchor, text_1);
										},
										$$slots: { default: true }
									});

									var node_4 = $.sibling(node_3, 2);

									HeaderPanelDivider(node_4, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text('Earlier');

											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});

									var node_5 = $.sibling(node_4, 2);

									HeaderPanelLink(node_5, {
										href: '/billing',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_3 = $.text('Your monthly invoice is ready');

											$.append($$anchor, text_3);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_1, 2);

					HeaderAction(node_6, {
						iconDescription: 'Help',
						get icon() {
							return Help;
						},

						get isOpen() {
							return isOpen2;
						},

						set isOpen($$value) {
							isOpen2 = $$value;
						},

						$$events: {
							open: () => {
								isOpen1 = false;
								isOpen3 = false;
							}
						},

						children: ($$anchor, $$slotProps) => {
							HeaderPanelLinks($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_6 = root();
									var node_7 = $.first_child(fragment_6);

									HeaderPanelDivider(node_7, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_4 = $.text('Support');

											$.append($$anchor, text_4);
										},
										$$slots: { default: true }
									});

									var node_8 = $.sibling(node_7, 2);

									HeaderPanelLink(node_8, {
										href: '/docs',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_5 = $.text('Documentation');

											$.append($$anchor, text_5);
										},
										$$slots: { default: true }
									});

									var node_9 = $.sibling(node_8, 2);

									HeaderPanelDivider(node_9, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_6 = $.text('Community');

											$.append($$anchor, text_6);
										},
										$$slots: { default: true }
									});

									var node_10 = $.sibling(node_9, 2);

									HeaderPanelLink(node_10, {
										href: '/support',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_7 = $.text('Open a case');

											$.append($$anchor, text_7);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_6);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_11 = $.sibling(node_6, 2);

					HeaderAction(node_11, {
						text: 'IBM Cloud',
						get isOpen() {
							return isOpen3;
						},

						set isOpen($$value) {
							isOpen3 = $$value;
						},

						$$events: {
							open: () => {
								isOpen1 = false;
								isOpen2 = false;
							}
						},

						children: ($$anchor, $$slotProps) => {
							HeaderPanelLinks($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_8 = root_1();
									var node_12 = $.first_child(fragment_8);

									HeaderPanelDivider(node_12, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_8 = $.text('Switch product');

											$.append($$anchor, text_8);
										},
										$$slots: { default: true }
									});

									var node_13 = $.sibling(node_12, 2);

									HeaderPanelLink(node_13, {
										href: '/watson-studio',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_9 = $.text('Watson Studio');

											$.append($$anchor, text_9);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_8);
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

		$$slots: {
			default: true,
			skipToContent: ($$anchor, $$slotProps) => {
				SkipToContent($$anchor, {});
			}
		}
	});

	var node_14 = $.sibling(node, 2);

	Content(node_14, {
		children: ($$anchor, $$slotProps) => {
			Grid($$anchor, {
				children: ($$anchor, $$slotProps) => {
					Row($$anchor, {
						children: ($$anchor, $$slotProps) => {
							Column($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var h1 = root_3();

									$.append($$anchor, h1);
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
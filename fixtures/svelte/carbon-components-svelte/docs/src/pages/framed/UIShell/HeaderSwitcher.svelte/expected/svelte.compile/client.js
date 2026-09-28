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
	RadioTile,
	Row,
	SideNav,
	SideNavItems,
	SideNavLink,
	SideNavMenu,
	SideNavMenuItem,
	SkipToContent,
	TileGroup
} from "carbon-components-svelte";

import { expoIn } from "svelte/easing";

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);

var root_3 = $.from_html(
	`<h1>App switcher</h1> <p>Select a transition option below and click on the App Switcher icon in
          the top right.</p> <!>`,
	1
);

export default function HeaderSwitcher($$anchor) {
	let isSideNavOpen = false;
	let isOpen = false;
	let selected = "0";

	let transitions = {
		0: { text: "None (default)", value: false },
		1: { text: "Slide (duration: 200ms)", value: { duration: 200 } },
		2: {
			text: "Custom (duration: 600ms, delay: 50ms, easing: expoIn)",
			value: { duration: 600, delay: 50, easing: expoIn }
		}
	};

	var fragment = root_1();
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
			HeaderUtilities($$anchor, {
				children: ($$anchor, $$slotProps) => {
					HeaderAction($$anchor, {
						get transition() {
							return transitions[selected].value;
						},

						get isOpen() {
							return isOpen;
						},

						set isOpen($$value) {
							isOpen = $$value;
						},

						children: ($$anchor, $$slotProps) => {
							HeaderPanelLinks($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root();
									var node_1 = $.first_child(fragment_4);

									HeaderPanelDivider(node_1, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text('Switch product');

											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});

									var node_2 = $.sibling(node_1, 2);

									HeaderPanelLink(node_2, {
										href: '/cloud',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_1 = $.text('Cloud console');

											$.append($$anchor, text_1);
										},
										$$slots: { default: true }
									});

									var node_3 = $.sibling(node_2, 2);

									HeaderPanelLink(node_3, {
										href: '/watson-studio',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text('Watson Studio');

											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});

									var node_4 = $.sibling(node_3, 2);

									HeaderPanelLink(node_4, {
										href: '/maximo',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_3 = $.text('Maximo Application Suite');

											$.append($$anchor, text_3);
										},
										$$slots: { default: true }
									});

									var node_5 = $.sibling(node_4, 2);

									HeaderPanelDivider(node_5, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_4 = $.text('Resources');

											$.append($$anchor, text_4);
										},
										$$slots: { default: true }
									});

									var node_6 = $.sibling(node_5, 2);

									HeaderPanelLink(node_6, {
										href: '/docs',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_5 = $.text('Documentation');

											$.append($$anchor, text_5);
										},
										$$slots: { default: true }
									});

									var node_7 = $.sibling(node_6, 2);

									HeaderPanelLink(node_7, {
										href: '/status',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_6 = $.text('Status page');

											$.append($$anchor, text_6);
										},
										$$slots: { default: true }
									});

									var node_8 = $.sibling(node_7, 2);

									HeaderPanelLink(node_8, {
										href: '/community',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_7 = $.text('Community');

											$.append($$anchor, text_7);
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

	var node_9 = $.sibling(node, 2);

	SideNav(node_9, {
		get isOpen() {
			return isSideNavOpen;
		},

		set isOpen($$value) {
			isSideNavOpen = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			SideNavItems($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_7 = root_2();
					var node_10 = $.first_child(fragment_7);

					SideNavLink(node_10, { href: '/dashboard', text: 'Dashboard' });

					var node_11 = $.sibling(node_10, 2);

					SideNavLink(node_11, { href: '/resources', text: 'Resource list' });

					var node_12 = $.sibling(node_11, 2);

					SideNavLink(node_12, { href: '/activity', text: 'Activity tracker' });

					var node_13 = $.sibling(node_12, 2);

					SideNavMenu(node_13, {
						text: 'Kubernetes',
						children: ($$anchor, $$slotProps) => {
							var fragment_8 = root_1();
							var node_14 = $.first_child(fragment_8);

							SideNavMenuItem(node_14, { href: '/kubernetes/clusters', text: 'Clusters' });

							var node_15 = $.sibling(node_14, 2);

							SideNavMenuItem(node_15, { href: '/kubernetes/worker-pools', text: 'Worker pools' });

							var node_16 = $.sibling(node_15, 2);

							SideNavMenuItem(node_16, { href: '/kubernetes/registry', text: 'Container registry' });
							$.append($$anchor, fragment_8);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_7);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_17 = $.sibling(node_9, 2);

	Content(node_17, {
		children: ($$anchor, $$slotProps) => {
			Grid($$anchor, {
				children: ($$anchor, $$slotProps) => {
					Row($$anchor, {
						children: ($$anchor, $$slotProps) => {
							Column($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_12 = root_3();
									var node_18 = $.sibling($.first_child(fragment_12), 4);

									TileGroup(node_18, {
										legendText: 'App switcher transitions',
										get selected() {
											return selected;
										},

										set selected($$value) {
											selected = $$value;
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_13 = $.comment();
											var node_19 = $.first_child(fragment_13);

											$.each(node_19, 17, () => Object.keys(transitions), $.index, ($$anchor, key) => {
												RadioTile($$anchor, {
													get value() {
														return $.get(key);
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_8 = $.text();

														$.template_effect(() => $.set_text(text_8, transitions[$.get(key)].text));
														$.append($$anchor, text_8);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_13);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_12);
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
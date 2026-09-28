import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Column from "carbon-components-svelte/Grid/Column.svelte";
import Grid from "carbon-components-svelte/Grid/Grid.svelte";
import Row from "carbon-components-svelte/Grid/Row.svelte";
import Content from "carbon-components-svelte/UIShell/Content.svelte";
import Header from "carbon-components-svelte/UIShell/Header.svelte";
import HeaderAction from "carbon-components-svelte/UIShell/HeaderAction.svelte";
import HeaderGlobalAction from "carbon-components-svelte/UIShell/HeaderGlobalAction.svelte";
import HeaderPanelDivider from "carbon-components-svelte/UIShell/HeaderPanelDivider.svelte";
import HeaderPanelLink from "carbon-components-svelte/UIShell/HeaderPanelLink.svelte";
import HeaderPanelLinks from "carbon-components-svelte/UIShell/HeaderPanelLinks.svelte";
import HeaderUtilities from "carbon-components-svelte/UIShell/HeaderUtilities.svelte";
import SideNav from "carbon-components-svelte/UIShell/SideNav.svelte";
import SideNavItems from "carbon-components-svelte/UIShell/SideNavItems.svelte";
import SideNavLink from "carbon-components-svelte/UIShell/SideNavLink.svelte";
import SideNavMenu from "carbon-components-svelte/UIShell/SideNavMenu.svelte";
import SideNavMenuItem from "carbon-components-svelte/UIShell/SideNavMenuItem.svelte";
import SkipToContent from "carbon-components-svelte/UIShell/SkipToContent.svelte";
import SettingsAdjust from "carbon-icons-svelte/lib/SettingsAdjust.svelte";
import { quintOut } from "svelte/easing";

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div slot="skipToContent"><!></div>`);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_5 = $.from_html(`<h1>Welcome</h1>`);

export default function HeaderUtilities_test($$anchor, $$props) {
	let isSideNavOpen = false;
	let isOpen = false;
	var fragment = root_3();
	var node = $.first_child(fragment);

	Header(node, {
		companyName: 'IBM',
		platformName: 'Carbon Svelte',
		get isSideNavOpen() {
			return isSideNavOpen;
		},

		set isSideNavOpen($$value) {
			isSideNavOpen = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			HeaderUtilities($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node_1 = $.first_child(fragment_2);

					HeaderGlobalAction(node_1, {
						iconDescription: 'Settings',
						get icon() {
							return SettingsAdjust;
						}
					});

					var node_2 = $.sibling(node_1, 2);

					{
						let $0 = $.derived(() => ({ duration: 400, easing: quintOut }));

						HeaderAction(node_2, {
							iconDescription: 'Switcher',
							tooltipAlignment: 'start',
							get transition() {
								return $.get($0);
							},

							get isOpen() {
								return isOpen;
							},

							set isOpen($$value) {
								isOpen = $$value;
							},

							$$events: {
								open: function ($$arg) {
									$.bubble_event.call(this, $$props, $$arg);
								},

								close: function ($$arg) {
									$.bubble_event.call(this, $$props, $$arg);
								}
							},

							children: ($$anchor, $$slotProps) => {
								HeaderPanelLinks($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root();
										var node_3 = $.first_child(fragment_4);

										HeaderPanelDivider(node_3, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Switcher subject 1');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});

										var node_4 = $.sibling(node_3, 2);

										HeaderPanelLink(node_4, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('Switcher item 1');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});

										var node_5 = $.sibling(node_4, 2);

										HeaderPanelDivider(node_5, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text('Switcher subject 2');

												$.append($$anchor, text_2);
											},
											$$slots: { default: true }
										});

										var node_6 = $.sibling(node_5, 2);

										HeaderPanelLink(node_6, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_3 = $.text('Switcher item 1');

												$.append($$anchor, text_3);
											},
											$$slots: { default: true }
										});

										var node_7 = $.sibling(node_6, 2);

										HeaderPanelLink(node_7, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_4 = $.text('Switcher item 2');

												$.append($$anchor, text_4);
											},
											$$slots: { default: true }
										});

										var node_8 = $.sibling(node_7, 2);

										HeaderPanelLink(node_8, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_5 = $.text('Switcher item 3');

												$.append($$anchor, text_5);
											},
											$$slots: { default: true }
										});

										var node_9 = $.sibling(node_8, 2);

										HeaderPanelLink(node_9, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_6 = $.text('Switcher item 4');

												$.append($$anchor, text_6);
											},
											$$slots: { default: true }
										});

										var node_10 = $.sibling(node_9, 2);

										HeaderPanelLink(node_10, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_7 = $.text('Switcher item 5');

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
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},

		$$slots: {
			default: true,
			skipToContent: ($$anchor, $$slotProps) => {
				var div = root_2();
				var node_11 = $.child(div);

				SkipToContent(node_11, {});
				$.reset(div);
				$.append($$anchor, div);
			}
		}
	});

	var node_12 = $.sibling(node, 2);

	SideNav(node_12, {
		get isOpen() {
			return isSideNavOpen;
		},

		set isOpen($$value) {
			isSideNavOpen = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			SideNavItems($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_6 = root_4();
					var node_13 = $.first_child(fragment_6);

					SideNavLink(node_13, { text: 'Link 1' });

					var node_14 = $.sibling(node_13, 2);

					SideNavLink(node_14, { text: 'Link 2' });

					var node_15 = $.sibling(node_14, 2);

					SideNavLink(node_15, { text: 'Link 3' });

					var node_16 = $.sibling(node_15, 2);

					SideNavMenu(node_16, {
						text: 'Menu',
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = root_3();
							var node_17 = $.first_child(fragment_7);

							SideNavMenuItem(node_17, { href: '/', text: 'Link 1' });

							var node_18 = $.sibling(node_17, 2);

							SideNavMenuItem(node_18, { href: '/', text: 'Link 2' });

							var node_19 = $.sibling(node_18, 2);

							SideNavMenuItem(node_19, { href: '/', text: 'Link 3' });
							$.append($$anchor, fragment_7);
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

	var node_20 = $.sibling(node_12, 2);

	Content(node_20, {
		children: ($$anchor, $$slotProps) => {
			Grid($$anchor, {
				children: ($$anchor, $$slotProps) => {
					Row($$anchor, {
						children: ($$anchor, $$slotProps) => {
							Column($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var h1 = root_5();

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
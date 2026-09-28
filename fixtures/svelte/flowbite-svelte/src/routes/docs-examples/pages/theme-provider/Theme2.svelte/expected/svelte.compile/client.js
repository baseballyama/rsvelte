import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	ThemeProvider,
	Accordion,
	AccordionItem,
	Alert,
	Avatar,
	Badge,
	Heading,
	Banner,
	P,
	BottomNav,
	BottomNavItem,
	Breadcrumb,
	BreadcrumbItem,
	ButtonGroup,
	Button,
	GradientButton,
	Card
} from "flowbite-svelte";

import {
	HomeSolid,
	WalletSolid,
	AdjustmentsVerticalOutline,
	UserCircleSolid
} from "flowbite-svelte-icons";

var root = $.from_html(`<span>Section 1</span>`);
var root_1 = $.from_html(`<p>Content for section 1</p>`);
var root_2 = $.from_html(`<span>Section 2</span>`);
var root_3 = $.from_html(`<p>Content for section 2</p>`);
var root_4 = $.from_html(`<!> <!>`, 1);
var root_5 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_6 = $.from_html(`<!> <!> <!>`, 1);
var root_7 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <div class="relative h-96 w-96 border p-4"><!> <!></div> <!> <div class="relative h-96 w-96 border p-4"><!> <!></div> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Theme2($$anchor) {
	// theme types
	const theme = {
		accordion: "w-96 text-green-500",
		accordionItem: { button: "text-purple-500" },
		alert: "bg-green-500 text-white w-48",
		avatar: "bg-blue-50 text-green-700 ring-red-400 dark:ring-red-300",
		badge: { base: "bg-purple-400 text-white" },
		banner: { base: "mx-auto bg-yellow-400 border-blue-600" },
		bottomNav: { inner: "border-red-500" },
		bottomNavItem: { base: "bg-blue-200", span: "bg-green-400" },
		breadcrumb: { list: "bg-blue-100" },
		breadcrumbItem: { separator: "text-green-500" },
		buttonGroup: "shadow-lg *:ring-primary-700!",
		button: { base: "w-48", outline: "", shadow: "" },
		gradientButton: { base: "", outlineWrapper: "" },
		card: { base: "bg-red-50 w-72 p-4 sm:p-6 md:p-8", image: "" },
		heading: "my-8"
	};

	const theme2 = {
		paragraph: "me-8 flex items-center text-lg font-normal text-blue-500 md:me-0 dark:text-blue-400"
	};

	const theme3 = {
		heading: "mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
	};

	ThemeProvider($$anchor, {
		get theme() {
			return theme;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_7();
			var node = $.first_child(fragment_1);

			P(node, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('This is rather ugly examples but');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Heading(node_1, {
				tag: 'h2',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Accordion');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Accordion(node_2, {
				flush: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_4();
					var node_3 = $.first_child(fragment_2);

					{
						const header = ($$anchor) => {
							var span = root();

							$.append($$anchor, span);
						};

						AccordionItem(node_3, {
							header,
							children: ($$anchor, $$slotProps) => {
								var p = root_1();

								$.append($$anchor, p);
							},
							$$slots: { header: true, default: true }
						});
					}

					var node_4 = $.sibling(node_3, 2);

					{
						const header = ($$anchor) => {
							var span_1 = root_2();

							$.append($$anchor, span_1);
						};

						AccordionItem(node_4, {
							header,
							children: ($$anchor, $$slotProps) => {
								var p_1 = root_3();

								$.append($$anchor, p_1);
							},
							$$slots: { header: true, default: true }
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_2, 2);

			Heading(node_5, {
				tag: 'h2',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Alert');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_5, 2);

			Alert(node_6, {
				dismissable: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Danger!');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_6, 2);

			Heading(node_7, {
				tag: 'h2',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Avatar');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_7, 2);

			Avatar(node_8, { dot: { color: "red" }, border: true });

			var node_9 = $.sibling(node_8, 2);

			Heading(node_9, {
				tag: 'h2',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('Badge');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node_9, 2);

			Badge(node_10, {
				dismissable: true,
				rounded: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_6 = $.text('Default');

					$.append($$anchor, text_6);
				},
				$$slots: { default: true }
			});

			var node_11 = $.sibling(node_10, 2);

			Heading(node_11, {
				tag: 'h2',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_7 = $.text('Banner');

					$.append($$anchor, text_7);
				},
				$$slots: { default: true }
			});

			var div = $.sibling(node_11, 2);
			var node_12 = $.child(div);

			Banner(node_12, {
				class: 'absolute',
				children: ($$anchor, $$slotProps) => {
					ThemeProvider($$anchor, {
						get theme() {
							return theme2;
						},

						children: ($$anchor, $$slotProps) => {
							P($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_8 = $.text('Content');

									$.append($$anchor, text_8);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_13 = $.sibling(node_12, 2);

			P(node_13, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_9 = $.text('Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloribus unde ratione voluptatibus ex nobis nostrum eum aliquid sit vitae odio tempora a impedit ducimus omnis, itaque illo? Illo,\n      voluptas natus!');

					$.append($$anchor, text_9);
				},
				$$slots: { default: true }
			});

			$.reset(div);

			var node_14 = $.sibling(div, 2);

			Heading(node_14, {
				tag: 'h2',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_10 = $.text('Bottom Navigation');

					$.append($$anchor, text_10);
				},
				$$slots: { default: true }
			});

			var div_1 = $.sibling(node_14, 2);
			var node_15 = $.child(div_1);

			P(node_15, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_11 = $.text('Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloribus unde ratione voluptatibus ex nobis nostrum eum aliquid sit vitae odio tempora a impedit ducimus omnis, itaque illo? Illo,\n      voluptas natus!');

					$.append($$anchor, text_11);
				},
				$$slots: { default: true }
			});

			var node_16 = $.sibling(node_15, 2);

			BottomNav(node_16, {
				position: 'absolute',
				classes: { inner: "grid-cols-4" },
				children: ($$anchor, $$slotProps) => {
					var fragment_5 = root_5();
					var node_17 = $.first_child(fragment_5);

					BottomNavItem(node_17, {
						btnName: 'Home',
						children: ($$anchor, $$slotProps) => {
							HomeSolid($$anchor, {});
						},
						$$slots: { default: true }
					});

					var node_18 = $.sibling(node_17, 2);

					BottomNavItem(node_18, {
						btnName: 'Wallet',
						children: ($$anchor, $$slotProps) => {
							WalletSolid($$anchor, {});
						},
						$$slots: { default: true }
					});

					var node_19 = $.sibling(node_18, 2);

					BottomNavItem(node_19, {
						btnName: 'Settings',
						children: ($$anchor, $$slotProps) => {
							AdjustmentsVerticalOutline($$anchor, {});
						},
						$$slots: { default: true }
					});

					var node_20 = $.sibling(node_19, 2);

					BottomNavItem(node_20, {
						btnName: 'Profile',
						children: ($$anchor, $$slotProps) => {
							UserCircleSolid($$anchor, {});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});

			$.reset(div_1);

			var node_21 = $.sibling(div_1, 2);

			Heading(node_21, {
				tag: 'h2',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_12 = $.text('Breadcrumb');

					$.append($$anchor, text_12);
				},
				$$slots: { default: true }
			});

			var node_22 = $.sibling(node_21, 2);

			Breadcrumb(node_22, {
				'aria-label': 'Solid background breadcrumb example',
				solid: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_10 = root_6();
					var node_23 = $.first_child(fragment_10);

					BreadcrumbItem(node_23, {
						href: '/',
						home: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_13 = $.text('Home');

							$.append($$anchor, text_13);
						},
						$$slots: { default: true }
					});

					var node_24 = $.sibling(node_23, 2);

					BreadcrumbItem(node_24, {
						href: '/',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_14 = $.text('Projects');

							$.append($$anchor, text_14);
						},
						$$slots: { default: true }
					});

					var node_25 = $.sibling(node_24, 2);

					BreadcrumbItem(node_25, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_15 = $.text('Flowbite Svelte');

							$.append($$anchor, text_15);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_10);
				},
				$$slots: { default: true }
			});

			var node_26 = $.sibling(node_22, 2);

			Heading(node_26, {
				tag: 'h2',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_16 = $.text('Button Group');

					$.append($$anchor, text_16);
				},
				$$slots: { default: true }
			});

			var node_27 = $.sibling(node_26, 2);

			ButtonGroup(node_27, {
				children: ($$anchor, $$slotProps) => {
					var fragment_11 = root_6();
					var node_28 = $.first_child(fragment_11);

					Button(node_28, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_17 = $.text('Profile');

							$.append($$anchor, text_17);
						},
						$$slots: { default: true }
					});

					var node_29 = $.sibling(node_28, 2);

					Button(node_29, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_18 = $.text('Settings');

							$.append($$anchor, text_18);
						},
						$$slots: { default: true }
					});

					var node_30 = $.sibling(node_29, 2);

					Button(node_30, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_19 = $.text('Messages');

							$.append($$anchor, text_19);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_11);
				},
				$$slots: { default: true }
			});

			var node_31 = $.sibling(node_27, 2);

			Heading(node_31, {
				tag: 'h2',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_20 = $.text('Buttons');

					$.append($$anchor, text_20);
				},
				$$slots: { default: true }
			});

			var node_32 = $.sibling(node_31, 2);

			Button(node_32, {
				pill: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_21 = $.text('Default');

					$.append($$anchor, text_21);
				},
				$$slots: { default: true }
			});

			var node_33 = $.sibling(node_32, 2);

			GradientButton(node_33, {
				shadow: true,
				color: 'blue',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_22 = $.text('Blue');

					$.append($$anchor, text_22);
				},
				$$slots: { default: true }
			});

			var node_34 = $.sibling(node_33, 2);

			Heading(node_34, {
				tag: 'h2',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_23 = $.text('Card');

					$.append($$anchor, text_23);
				},
				$$slots: { default: true }
			});

			var node_35 = $.sibling(node_34, 2);

			Card(node_35, {
				href: '/cards',
				children: ($$anchor, $$slotProps) => {
					var fragment_12 = root_4();
					var node_36 = $.first_child(fragment_12);

					ThemeProvider(node_36, {
						get theme() {
							return theme3;
						},

						children: ($$anchor, $$slotProps) => {
							Heading($$anchor, {
								tag: 'h5',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_24 = $.text('Noteworthy technology');

									$.append($$anchor, text_24);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_37 = $.sibling(node_36, 2);

					P(node_37, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_25 = $.text('Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.');

							$.append($$anchor, text_25);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_12);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}
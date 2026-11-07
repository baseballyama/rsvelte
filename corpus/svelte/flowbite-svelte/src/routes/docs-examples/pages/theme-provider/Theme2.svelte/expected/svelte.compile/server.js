import * as $ from 'svelte/internal/server';

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

export default function Theme2($$renderer) {
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

	ThemeProvider($$renderer, {
		theme,
		children: ($$renderer) => {
			P($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->This is rather ugly examples but`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Heading($$renderer, {
				tag: 'h2',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Accordion`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Accordion($$renderer, {
				flush: true,
				children: ($$renderer) => {
					{
						function header($$renderer) {
							$$renderer.push(`<span>Section 1</span>`);
						}

						AccordionItem($$renderer, {
							header,
							children: ($$renderer) => {
								$$renderer.push(`<p>Content for section 1</p>`);
							},
							$$slots: { header: true, default: true }
						});
					}

					$$renderer.push(`<!----> `);

					{
						function header($$renderer) {
							$$renderer.push(`<span>Section 2</span>`);
						}

						AccordionItem($$renderer, {
							header,
							children: ($$renderer) => {
								$$renderer.push(`<p>Content for section 2</p>`);
							},
							$$slots: { header: true, default: true }
						});
					}

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Heading($$renderer, {
				tag: 'h2',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Alert`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Alert($$renderer, {
				dismissable: true,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Danger!`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Heading($$renderer, {
				tag: 'h2',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Avatar`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);
			Avatar($$renderer, { dot: { color: "red" }, border: true });
			$$renderer.push(`<!----> `);

			Heading($$renderer, {
				tag: 'h2',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Badge`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Badge($$renderer, {
				dismissable: true,
				rounded: true,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Default`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Heading($$renderer, {
				tag: 'h2',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Banner`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="relative h-96 w-96 border p-4">`);

			Banner($$renderer, {
				class: 'absolute',
				children: ($$renderer) => {
					ThemeProvider($$renderer, {
						theme: theme2,
						children: ($$renderer) => {
							P($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Content`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			P($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloribus unde ratione voluptatibus ex nobis nostrum eum aliquid sit vitae odio tempora a impedit ducimus omnis, itaque illo? Illo,
      voluptas natus!`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			Heading($$renderer, {
				tag: 'h2',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Bottom Navigation`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="relative h-96 w-96 border p-4">`);

			P($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloribus unde ratione voluptatibus ex nobis nostrum eum aliquid sit vitae odio tempora a impedit ducimus omnis, itaque illo? Illo,
      voluptas natus!`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			BottomNav($$renderer, {
				position: 'absolute',
				classes: { inner: "grid-cols-4" },
				children: ($$renderer) => {
					BottomNavItem($$renderer, {
						btnName: 'Home',
						children: ($$renderer) => {
							HomeSolid($$renderer, {});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					BottomNavItem($$renderer, {
						btnName: 'Wallet',
						children: ($$renderer) => {
							WalletSolid($$renderer, {});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					BottomNavItem($$renderer, {
						btnName: 'Settings',
						children: ($$renderer) => {
							AdjustmentsVerticalOutline($$renderer, {});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					BottomNavItem($$renderer, {
						btnName: 'Profile',
						children: ($$renderer) => {
							UserCircleSolid($$renderer, {});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			Heading($$renderer, {
				tag: 'h2',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Breadcrumb`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Breadcrumb($$renderer, {
				'aria-label': 'Solid background breadcrumb example',
				solid: true,
				children: ($$renderer) => {
					BreadcrumbItem($$renderer, {
						href: '/',
						home: true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Home`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					BreadcrumbItem($$renderer, {
						href: '/',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Projects`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					BreadcrumbItem($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Flowbite Svelte`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Heading($$renderer, {
				tag: 'h2',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Button Group`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonGroup($$renderer, {
				children: ($$renderer) => {
					Button($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Profile`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Settings`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Messages`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Heading($$renderer, {
				tag: 'h2',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Buttons`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				pill: true,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Default`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			GradientButton($$renderer, {
				shadow: true,
				color: 'blue',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Blue`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Heading($$renderer, {
				tag: 'h2',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Card`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Card($$renderer, {
				href: '/cards',
				children: ($$renderer) => {
					ThemeProvider($$renderer, {
						theme: theme3,
						children: ($$renderer) => {
							Heading($$renderer, {
								tag: 'h5',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Noteworthy technology`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					P($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}
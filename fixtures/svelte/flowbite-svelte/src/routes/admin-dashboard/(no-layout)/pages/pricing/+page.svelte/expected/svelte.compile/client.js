import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Button,
	DarkMode,
	NavBrand,
	NavHamburger,
	NavLi,
	NavUl,
	Navbar,
	Toggle,
	P
} from "flowbite-svelte";

import { ArrowLeftToBracketOutline, CloseOutline } from "flowbite-svelte-icons";
import MetaTag from "../../../utils/MetaTag.svelte";
import { PriceCard, PriceCardListItem, ComparisonTable, Faq, Footer } from "flowbite-svelte-admin-dashboard";
import { faqs, menus, rows, prices, brand } from "./data";

var root = $.from_html(`<img src="/images/flowbite-svelte-icon-logo.svg" class="me-3 h-6 sm:h-9" alt="Flowbite Logo"/> <span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Flowbite</span>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!>Login/Register`, 1);
var root_3 = $.from_html(`<!> <!> <!> <div class="py-4"><!> <!></div>`, 1);
var root_4 = $.from_html(`Team size: <span class="font-semibold">1 developer</span>`, 1);
var root_5 = $.from_html(`<!> Premium support`, 1);
var root_6 = $.from_html(`<!> Free updates`, 1);
var root_7 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_8 = $.from_html(`Team size: <span class="font-semibold">10 developers</span>`, 1);
var root_9 = $.from_html(`Premium support: <span class="font-semibold">24 months</span>`, 1);
var root_10 = $.from_html(`Free updates: <span class="font-semibold">24 months</span>`, 1);
var root_11 = $.from_html(`Team size: <span class="font-semibold">100 developers</span>`, 1);
var root_12 = $.from_html(`Premium support: <span class="font-semibold">36 months</span>`, 1);
var root_13 = $.from_html(`Free updates: <span class="font-semibold">36 months</span>`, 1);
var root_14 = $.from_html(`<!> <!> <main class="mx-auto bg-gray-50 dark:bg-gray-900"><div class="container mx-auto px-4 pt-24 md:pt-32 lg:px-0 dark:bg-gray-900"><h1 class="mb-3 text-3xl font-bold text-gray-900 sm:text-4xl sm:leading-none sm:tracking-tight dark:text-white">Our pricing plan made simple</h1> <p class="mb-6 text-lg font-normal text-gray-500 sm:text-xl dark:text-gray-300">All types of businesses need access to development resources, so we give you the option to decide how much you need to use.</p> <div class="flex items-center"><span class="text-base font-medium text-gray-900 dark:text-white">Monthly</span> <!> <span class="text-base font-medium text-gray-900 dark:text-gray-300">Yearly</span></div> <section class="grid grid-cols-1 space-y-12 pt-9 md:grid-cols-2 md:gap-6 md:space-y-0 md:gap-x-6 lg:grid-cols-3"><!> <!> <!></section> <section class="flex flex-col pt-10 md:pt-20"><div class="overflow-x-auto rounded-lg"><div class="inline-block min-w-full align-middle"><div class="overflow-hidden shadow sm:rounded-lg"><!></div></div></div></section> <section class="pt-20"><!></section></div></main> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let yearly = $.state(false);
	let period = $.derived(() => $.get(yearly) ? "year" : "month");
	const path = "/pages/pricing";
	const description = "Pricing examaple - Flowbite Svelte Admin Dashboard";
	const title = "Flowbite Svelte Admin Dashboard - Pricing";
	const subtitle = "Pricing";
	var fragment = root_14();
	var node = $.first_child(fragment);

	MetaTag(node, { path, description, title, subtitle });

	var node_1 = $.sibling(node, 2);

	Navbar(node_1, {
		class: 'fixed start-0 top-0 z-20 w-full border-b border-gray-200 bg-white px-2 py-1 sm:px-4 dark:border-gray-700 dark:bg-gray-900',
		color: 'dark',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_3();
			var node_2 = $.first_child(fragment_1);

			NavBrand(node_2, {
				href: '/',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();

					$.next(2);
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			NavHamburger(node_3, {});

			var node_4 = $.sibling(node_3, 2);

			NavUl(node_4, {
				class: 'ms-8 me-auto',
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_1();
					var node_5 = $.first_child(fragment_3);

					NavLi(node_5, {
						href: '/',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Home');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_5, 2);

					NavLi(node_6, {
						href: '/',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Team');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_7 = $.sibling(node_6, 2);

					NavLi(node_7, {
						href: '/',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Pricing');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_7, 2);

					NavLi(node_8, {
						href: '/',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Contact');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var div = $.sibling(node_4, 2);
			var node_9 = $.child(div);

			DarkMode(node_9, {});

			var node_10 = $.sibling(node_9, 2);

			Button(node_10, {
				class: 'gap-2 px-3',
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_2();
					var node_11 = $.first_child(fragment_4);

					ArrowLeftToBracketOutline(node_11, {});
					$.next();
					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			$.reset(div);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var main = $.sibling(node_1, 2);
	var div_1 = $.child(main);
	var div_2 = $.sibling($.child(div_1), 4);
	var node_12 = $.sibling($.child(div_2), 2);

	Toggle(node_12, {
		class: 'ms-3 peer-focus:ring-0',
		get checked() {
			return $.get(yearly);
		},

		set checked($$value) {
			$.set(yearly, $$value, true);
		}
	});

	$.next(2);
	$.reset(div_2);

	var section = $.sibling(div_2, 2);
	var node_13 = $.child(section);

	{
		const subtitle = ($$anchor) => {
			$.next();

			var text_4 = $.text('Best option for personal use and for your next project.');

			$.append($$anchor, text_4);
		};

		PriceCard(node_13, {
			title: 'Starter',
			get price() {
				return prices[0][+$.get(yearly)];
			},

			get period() {
				return $.get(period);
			},
			subtitle,
			children: ($$anchor, $$slotProps) => {
				var fragment_5 = root_7();
				var node_14 = $.first_child(fragment_5);

				PriceCardListItem(node_14, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_5 = $.text('Individual configuration');

						$.append($$anchor, text_5);
					},
					$$slots: { default: true }
				});

				var node_15 = $.sibling(node_14, 2);

				PriceCardListItem(node_15, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_6 = $.text('No setup, or hidden fees');

						$.append($$anchor, text_6);
					},
					$$slots: { default: true }
				});

				var node_16 = $.sibling(node_15, 2);

				PriceCardListItem(node_16, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var fragment_6 = root_4();

						$.next();
						$.append($$anchor, fragment_6);
					},
					$$slots: { default: true }
				});

				var node_17 = $.sibling(node_16, 2);

				PriceCardListItem(node_17, {
					icon: true,
					children: ($$anchor, $$slotProps) => {
						var fragment_7 = root_5();
						var node_18 = $.first_child(fragment_7);

						CloseOutline(node_18, { class: 'mr-2 inline text-red-500 dark:text-red-400' });
						$.next();
						$.append($$anchor, fragment_7);
					},
					$$slots: { default: true }
				});

				var node_19 = $.sibling(node_17, 2);

				PriceCardListItem(node_19, {
					icon: true,
					children: ($$anchor, $$slotProps) => {
						var fragment_8 = root_6();
						var node_20 = $.first_child(fragment_8);

						CloseOutline(node_20, { class: 'mr-2 inline text-red-500 dark:text-red-400' });
						$.next();
						$.append($$anchor, fragment_8);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_5);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	var node_21 = $.sibling(node_13, 2);

	{
		const subtitle = ($$anchor) => {
			$.next();

			var text_7 = $.text('Relevant for multiple users, extended & premium support.');

			$.append($$anchor, text_7);
		};

		PriceCard(node_21, {
			title: 'Company',
			get price() {
				return prices[1][+$.get(yearly)];
			},

			get period() {
				return $.get(period);
			},
			subtitle,
			children: ($$anchor, $$slotProps) => {
				var fragment_9 = root_7();
				var node_22 = $.first_child(fragment_9);

				PriceCardListItem(node_22, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_8 = $.text('Individual configuration');

						$.append($$anchor, text_8);
					},
					$$slots: { default: true }
				});

				var node_23 = $.sibling(node_22, 2);

				PriceCardListItem(node_23, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_9 = $.text('No setup, or hidden fees');

						$.append($$anchor, text_9);
					},
					$$slots: { default: true }
				});

				var node_24 = $.sibling(node_23, 2);

				PriceCardListItem(node_24, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var fragment_10 = root_8();

						$.next();
						$.append($$anchor, fragment_10);
					},
					$$slots: { default: true }
				});

				var node_25 = $.sibling(node_24, 2);

				PriceCardListItem(node_25, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var fragment_11 = root_9();

						$.next();
						$.append($$anchor, fragment_11);
					},
					$$slots: { default: true }
				});

				var node_26 = $.sibling(node_25, 2);

				PriceCardListItem(node_26, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var fragment_12 = root_10();

						$.next();
						$.append($$anchor, fragment_12);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_9);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	var node_27 = $.sibling(node_21, 2);

	{
		const subtitle = ($$anchor) => {
			$.next();

			var text_10 = $.text('Best for large scale uses and extended redistribution rights.');

			$.append($$anchor, text_10);
		};

		PriceCard(node_27, {
			title: 'Enterprise',
			get price() {
				return prices[2][+$.get(yearly)];
			},

			get period() {
				return $.get(period);
			},
			subtitle,
			children: ($$anchor, $$slotProps) => {
				var fragment_13 = root_7();
				var node_28 = $.first_child(fragment_13);

				PriceCardListItem(node_28, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_11 = $.text('Individual configuration');

						$.append($$anchor, text_11);
					},
					$$slots: { default: true }
				});

				var node_29 = $.sibling(node_28, 2);

				PriceCardListItem(node_29, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_12 = $.text('No setup, or hidden fees');

						$.append($$anchor, text_12);
					},
					$$slots: { default: true }
				});

				var node_30 = $.sibling(node_29, 2);

				PriceCardListItem(node_30, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var fragment_14 = root_11();

						$.next();
						$.append($$anchor, fragment_14);
					},
					$$slots: { default: true }
				});

				var node_31 = $.sibling(node_30, 2);

				PriceCardListItem(node_31, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var fragment_15 = root_12();

						$.next();
						$.append($$anchor, fragment_15);
					},
					$$slots: { default: true }
				});

				var node_32 = $.sibling(node_31, 2);

				PriceCardListItem(node_32, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var fragment_16 = root_13();

						$.next();
						$.append($$anchor, fragment_16);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_13);
			},
			$$slots: { subtitle: true, default: true }
		});
	}

	$.reset(section);

	var section_1 = $.sibling(section, 2);
	var div_3 = $.child(section_1);
	var div_4 = $.child(div_3);
	var div_5 = $.child(div_4);
	var node_33 = $.child(div_5);

	ComparisonTable(node_33, {
		get rows() {
			return rows;
		}
	});

	$.reset(div_5);
	$.reset(div_4);
	$.reset(div_3);
	$.reset(section_1);

	var section_2 = $.sibling(section_1, 2);
	var node_34 = $.child(section_2);

	Faq(node_34, {
		get faqs() {
			return faqs;
		},
		title: 'Frequently asked questions'
	});

	$.reset(section_2);
	$.reset(div_1);
	$.reset(main);

	var node_35 = $.sibling(main, 2);

	{
		const description = ($$anchor) => {
			P($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_13 = $.text('Flowbite is a UI library of elements & components based on Tailwind CSS that can get you started building websites faster and more efficiently.');

					$.append($$anchor, text_13);
				},
				$$slots: { default: true }
			});
		};

		Footer(node_35, {
			get menus() {
				return menus;
			},

			get brand() {
				return brand;
			},
			description,
			$$slots: { description: true }
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}
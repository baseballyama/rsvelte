import * as $ from 'svelte/internal/server';

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

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let yearly = false;
		let period = $.derived(() => yearly ? "year" : "month");
		const path = "/pages/pricing";
		const description = "Pricing examaple - Flowbite Svelte Admin Dashboard";
		const title = "Flowbite Svelte Admin Dashboard - Pricing";
		const subtitle = "Pricing";
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			MetaTag($$renderer, { path, description, title, subtitle });
			$$renderer.push(`<!----> `);

			Navbar($$renderer, {
				class: 'fixed start-0 top-0 z-20 w-full border-b border-gray-200 bg-white px-2 py-1 sm:px-4 dark:border-gray-700 dark:bg-gray-900',
				color: 'dark',
				children: ($$renderer) => {
					NavBrand($$renderer, {
						href: '/',
						children: ($$renderer) => {
							$$renderer.push(`<img src="/images/flowbite-svelte-icon-logo.svg" class="me-3 h-6 sm:h-9" alt="Flowbite Logo"/> <span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Flowbite</span>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);
					NavHamburger($$renderer, {});
					$$renderer.push(`<!----> `);

					NavUl($$renderer, {
						class: 'ms-8 me-auto',
						children: ($$renderer) => {
							NavLi($$renderer, {
								href: '/',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Home`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							NavLi($$renderer, {
								href: '/',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Team`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							NavLi($$renderer, {
								href: '/',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Pricing`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							NavLi($$renderer, {
								href: '/',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Contact`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> <div class="py-4">`);
					DarkMode($$renderer, {});
					$$renderer.push(`<!----> `);

					Button($$renderer, {
						class: 'gap-2 px-3',
						children: ($$renderer) => {
							ArrowLeftToBracketOutline($$renderer, {});
							$$renderer.push(`<!---->Login/Register`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <main class="mx-auto bg-gray-50 dark:bg-gray-900"><div class="container mx-auto px-4 pt-24 md:pt-32 lg:px-0 dark:bg-gray-900"><h1 class="mb-3 text-3xl font-bold text-gray-900 sm:text-4xl sm:leading-none sm:tracking-tight dark:text-white">Our pricing plan made simple</h1> <p class="mb-6 text-lg font-normal text-gray-500 sm:text-xl dark:text-gray-300">All types of businesses need access to development resources, so we give you the option to decide how much you need to use.</p> <div class="flex items-center"><span class="text-base font-medium text-gray-900 dark:text-white">Monthly</span> `);

			Toggle($$renderer, {
				class: 'ms-3 peer-focus:ring-0',
				get checked() {
					return yearly;
				},

				set checked($$value) {
					yearly = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <span class="text-base font-medium text-gray-900 dark:text-gray-300">Yearly</span></div> <section class="grid grid-cols-1 space-y-12 pt-9 md:grid-cols-2 md:gap-6 md:space-y-0 md:gap-x-6 lg:grid-cols-3">`);

			{
				function subtitle($$renderer) {
					$$renderer.push(`<!---->Best option for personal use and for your next project.`);
				}

				PriceCard($$renderer, {
					title: 'Starter',
					price: prices[0][+yearly],
					period: period(),
					subtitle,
					children: ($$renderer) => {
						PriceCardListItem($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Individual configuration`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						PriceCardListItem($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->No setup, or hidden fees`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						PriceCardListItem($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Team size: <span class="font-semibold">1 developer</span>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						PriceCardListItem($$renderer, {
							icon: true,
							children: ($$renderer) => {
								CloseOutline($$renderer, { class: 'mr-2 inline text-red-500 dark:text-red-400' });
								$$renderer.push(`<!----> Premium support`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						PriceCardListItem($$renderer, {
							icon: true,
							children: ($$renderer) => {
								CloseOutline($$renderer, { class: 'mr-2 inline text-red-500 dark:text-red-400' });
								$$renderer.push(`<!----> Free updates`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { subtitle: true, default: true }
				});
			}

			$$renderer.push(`<!----> `);

			{
				function subtitle($$renderer) {
					$$renderer.push(`<!---->Relevant for multiple users, extended &amp; premium support.`);
				}

				PriceCard($$renderer, {
					title: 'Company',
					price: prices[1][+yearly],
					period: period(),
					subtitle,
					children: ($$renderer) => {
						PriceCardListItem($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Individual configuration`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						PriceCardListItem($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->No setup, or hidden fees`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						PriceCardListItem($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Team size: <span class="font-semibold">10 developers</span>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						PriceCardListItem($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Premium support: <span class="font-semibold">24 months</span>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						PriceCardListItem($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Free updates: <span class="font-semibold">24 months</span>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { subtitle: true, default: true }
				});
			}

			$$renderer.push(`<!----> `);

			{
				function subtitle($$renderer) {
					$$renderer.push(`<!---->Best for large scale uses and extended redistribution rights.`);
				}

				PriceCard($$renderer, {
					title: 'Enterprise',
					price: prices[2][+yearly],
					period: period(),
					subtitle,
					children: ($$renderer) => {
						PriceCardListItem($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Individual configuration`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						PriceCardListItem($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->No setup, or hidden fees`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						PriceCardListItem($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Team size: <span class="font-semibold">100 developers</span>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						PriceCardListItem($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Premium support: <span class="font-semibold">36 months</span>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						PriceCardListItem($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Free updates: <span class="font-semibold">36 months</span>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { subtitle: true, default: true }
				});
			}

			$$renderer.push(`<!----></section> <section class="flex flex-col pt-10 md:pt-20"><div class="overflow-x-auto rounded-lg"><div class="inline-block min-w-full align-middle"><div class="overflow-hidden shadow sm:rounded-lg">`);
			ComparisonTable($$renderer, { rows });
			$$renderer.push(`<!----></div></div></div></section> <section class="pt-20">`);
			Faq($$renderer, { faqs, title: 'Frequently asked questions' });
			$$renderer.push(`<!----></section></div></main> `);

			{
				function description($$renderer) {
					P($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Flowbite is a UI library of elements &amp; components based on Tailwind CSS that can get you started building websites faster and more efficiently.`);
						},
						$$slots: { default: true }
					});
				}

				Footer($$renderer, { menus, brand, description, $$slots: { description: true } });
			}

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}
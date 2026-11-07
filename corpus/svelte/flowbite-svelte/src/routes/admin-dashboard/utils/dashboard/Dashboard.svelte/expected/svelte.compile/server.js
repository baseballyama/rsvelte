import * as $ from 'svelte/internal/server';
import thickbars from "../graphs/thickbars";
import options from "../graphs/thinmultibars";
import trafficOptions from "../graphs/traffic";
import users from "../graphs/users";

import {
	DesktopPcOutline,
	MobilePhoneOutline,
	TabletOutline,
	ArrowRightOutline
} from "flowbite-svelte-icons";

import { Chart } from "@flowbite-svelte-plugins/chart";
import { P, Button, Timeline, TimelineItem } from "flowbite-svelte";

import {
	ChartWidget,
	Stats,
	More,
	ActivityList,
	ProductMetricCard,
	CategorySalesReport,
	DarkChart,
	Traffic,
	getChartOptions
} from "flowbite-svelte-admin-dashboard";

import Chat from "./Chat.svelte";
import Insights from "./Insights.svelte";
import Transactions from "./Transactions.svelte";
import Customers from "../../data/users.json";

export default function Dashboard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const series = [
			{
				name: "Revenue",
				data: [6356, 6218, 6156, 6526, 6356, 6256, 6056],
				color: "#EF562F"
			},

			{
				name: "Revenue (previous period)",
				data: [6556, 6725, 6424, 6356, 6586, 6756, 6616],
				color: "#FDBA8C"
			}
		];

		const products = [
			{
				src: "iphone.png",
				image: "iphone",
				label: "iPhone 14 Pro",
				change: 2.5,
				price: "$445,467"
			},

			{
				src: "imac.png",
				image: "imac",
				label: "Apple iMac 27",
				change: 12.5,
				price: "$256,982"
			},

			{
				src: "watch.png",
				image: "watch",
				label: "Apple Watch SE",
				change: -1.35,
				price: "$201,869"
			},

			{
				src: "ipad.png",
				image: "ipad",
				label: "Apple iPad Air",
				change: 12.5,
				price: "$103,967"
			},

			{
				src: "imac.png",
				image: "imac",
				label: "Apple iMac 24",
				change: -2,
				price: "$98,543 "
			}
		];

		const customers = Customers.slice(0, 5);
		let chartOptions = $.derived(() => getChartOptions(false));
		let dark = false;

		const statsCont = {
			title: "Statistics this month",
			popoverTitle: "Statistics",
			tab1Title: "Top products",
			tab2Title: "Top customers"
		};

		const devices = [
			{
				title: "Desktop",
				subtitle: "234k",
				change: 4,
				IconOption: { icon: DesktopPcOutline }
			},

			{
				title: "Phone",
				subtitle: "94k",
				change: -1,
				IconOption: { icon: MobilePhoneOutline }
			},

			{
				title: "Tablet",
				subtitle: "16k",
				change: -0.6,
				IconOption: { icon: TabletOutline }
			}
		];

		$$renderer.push(`<div class="mt-px space-y-4"><div class="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">`);

		ChartWidget($$renderer, {
			value: 12.5,
			chartOptions: chartOptions(),
			title: '$45,385',
			subtitle: 'Sales this week'
		});

		$$renderer.push(`<!----> `);

		{
			function popoverDesc($$renderer) {
				P($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Statistics is a branch of applied mathematics that involves the collection, description, analysis, and inference of conclusions from quantitative data.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);
				More($$renderer, { title: 'Read more', href: '#top', flat: true });
				$$renderer.push(`<!---->`);
			}

			Stats($$renderer, $.spread_props([
				{ products, customers },
				statsCont,
				{ popoverDesc, $$slots: { popoverDesc: true } }
			]));
		}

		$$renderer.push(`<!----></div> <div class="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3">`);

		{
			function chart($$renderer) {
				Chart($$renderer, { options: thickbars, class: 'w-full' });
			}

			ProductMetricCard($$renderer, {
				title: 'New products',
				subTitle: '2,340',
				changeProps: { size: "sm", value: 12.5, since: "Since last month" },
				chart,
				$$slots: { chart: true }
			});
		}

		$$renderer.push(`<!----> `);

		{
			function chart($$renderer) {
				DarkChart($$renderer, { configFunc: users, class: 'w-full' });
			}

			ProductMetricCard($$renderer, {
				title: 'Users',
				subTitle: '4,420',
				changeProps: { size: "sm", value: -3.4, since: "Since last month" },
				chart,
				$$slots: { chart: true }
			});
		}

		$$renderer.push(`<!----> `);

		{
			function chart($$renderer) {
				DarkChart($$renderer, {
					configFunc: (d) => {
						const x = users(d);

						if (x.plotOptions?.bar) {
							x.plotOptions.bar.horizontal = true;
						} else {
							x.plotOptions = { bar: { horizontal: true } };
						}

						return x;
					},
					class: 'w-full'
				});
			}

			ProductMetricCard($$renderer, {
				title: 'Users',
				subTitle: '4,420',
				changeProps: { size: "sm", value: -3.4, since: "Since last month" },
				chart,
				$$slots: { chart: true }
			});
		}

		$$renderer.push(`<!----></div> <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">`);
		Chat($$renderer, {});
		$$renderer.push(`<!----> <div class="flex flex-col gap-4">`);

		{
			function chart($$renderer) {
				Chart($$renderer, { options });
			}

			CategorySalesReport($$renderer, {
				title: 'Sales by category',
				subtitle: 'Desktop PC',
				changeProps: { value: 2.5, since: "Since last month", size: "sm" },
				chart,
				$$slots: { chart: true }
			});
		}

		$$renderer.push(`<!----> `);

		{
			function chart($$renderer) {
				Chart($$renderer, { options: trafficOptions(dark) });
			}

			Traffic($$renderer, { devices, chart, $$slots: { chart: true } });
		}

		$$renderer.push(`<!----></div></div> <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">`);

		{
			function actions($$renderer) {
				$$renderer.push(`<a href="#top" class="text-primary-700 dark:text-primary-500 inline-flex items-center rounded-lg p-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700">View all</a>`);
			}

			ActivityList($$renderer, {
				title: 'Latest Activity',
				actions,
				children: ($$renderer) => {
					Timeline($$renderer, {
						children: ($$renderer) => {
							TimelineItem($$renderer, {
								title: 'Application UI design in Figma',
								date: 'April 2025',
								children: ($$renderer) => {
									$$renderer.push(`<p class="mb-4 text-base font-normal text-gray-500 dark:text-gray-300">Get access to over 20+ pages including a dashboard layout, charts, kanban board, calendar, and pre-order E-commerce &amp; Marketing pages.</p> `);

									Button($$renderer, {
										color: 'alternative',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Learn more`);
											ArrowRightOutline($$renderer, { class: 'ms-2', size: 'sm' });
											$$renderer.push(`<!---->`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TimelineItem($$renderer, {
								title: 'Marketing UI code in Flowbite',
								date: 'March 2025',
								children: ($$renderer) => {
									$$renderer.push(`<p class="text-base font-normal text-gray-500 dark:text-gray-300">Get started with dozens of web components and interactive elements built on top of Tailwind CSS.</p> <a href="#top" class="text-primary-700 dark:text-primary-500 inline-flex items-center text-xs font-medium hover:underline sm:text-sm">Go to Flowbite Blocks`);
									ArrowRightOutline($$renderer, { class: 'ms-2', size: 'sm' });
									$$renderer.push(`<!----></a>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TimelineItem($$renderer, {
								title: 'Marketing UI design in Figma',
								date: 'February 2025',
								children: ($$renderer) => {
									$$renderer.push(`<p class="text-base font-normal text-gray-500 dark:text-gray-300">Get started with dozens of web components and interactive elements built on top of Tailwind CSS.</p>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { actions: true, default: true }
			});
		}

		$$renderer.push(`<!----> `);
		Insights($$renderer, {});
		$$renderer.push(`<!----></div> `);
		Transactions($$renderer, { dark });
		$$renderer.push(`<!----></div>`);
	});
}
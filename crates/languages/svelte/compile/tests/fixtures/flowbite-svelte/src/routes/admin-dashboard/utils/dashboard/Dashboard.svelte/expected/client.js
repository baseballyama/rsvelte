import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<a href="#top" class="text-primary-700 dark:text-primary-500 inline-flex items-center rounded-lg p-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700">View all</a>`);
var root_2 = $.from_html(`Learn more<!>`, 1);
var root_3 = $.from_html(`<p class="mb-4 text-base font-normal text-gray-500 dark:text-gray-300">Get access to over 20+ pages including a dashboard layout, charts, kanban board, calendar, and pre-order E-commerce & Marketing pages.</p> <!>`, 1);
var root_4 = $.from_html(`<p class="text-base font-normal text-gray-500 dark:text-gray-300">Get started with dozens of web components and interactive elements built on top of Tailwind CSS.</p> <a href="#top" class="text-primary-700 dark:text-primary-500 inline-flex items-center text-xs font-medium hover:underline sm:text-sm">Go to Flowbite Blocks<!></a>`, 1);
var root_5 = $.from_html(`<p class="text-base font-normal text-gray-500 dark:text-gray-300">Get started with dozens of web components and interactive elements built on top of Tailwind CSS.</p>`);
var root_6 = $.from_html(`<!> <!> <!>`, 1);
var root_7 = $.from_html(`<div class="mt-px space-y-4"><div class="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3"><!> <!></div> <div class="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3"><!> <!> <!></div> <div class="grid grid-cols-1 gap-4 xl:grid-cols-2"><!> <div class="flex flex-col gap-4"><!> <!></div></div> <div class="grid grid-cols-1 gap-4 xl:grid-cols-2"><!> <!></div> <!></div>`);

export default function Dashboard($$anchor, $$props) {
	$.push($$props, true);

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

	$.user_effect(() => {
		$.get(chartOptions).series = series;
	});

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

	var div = root_7();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	ChartWidget(node, {
		value: 12.5,
		get chartOptions() {
			return $.get(chartOptions);
		},
		title: '$45,385',
		subtitle: 'Sales this week'
	});

	var node_1 = $.sibling(node, 2);

	{
		const popoverDesc = ($$anchor) => {
			var fragment = root();
			var node_2 = $.first_child(fragment);

			P(node_2, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Statistics is a branch of applied mathematics that involves the collection, description, analysis, and inference of conclusions from quantitative data.');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			More(node_3, { title: 'Read more', href: '#top', flat: true });
			$.append($$anchor, fragment);
		};

		Stats(node_1, $.spread_props(
			{
				get products() {
					return products;
				},

				get customers() {
					return customers;
				}
			},
			() => statsCont,
			{ popoverDesc, $$slots: { popoverDesc: true } }
		));
	}

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_4 = $.child(div_2);

	{
		const chart = ($$anchor) => {
			Chart($$anchor, {
				get options() {
					return thickbars;
				},
				class: 'w-full'
			});
		};

		ProductMetricCard(node_4, {
			title: 'New products',
			subTitle: '2,340',
			changeProps: { size: "sm", value: 12.5, since: "Since last month" },
			chart,
			$$slots: { chart: true }
		});
	}

	var node_5 = $.sibling(node_4, 2);

	{
		const chart = ($$anchor) => {
			DarkChart($$anchor, {
				get configFunc() {
					return users;
				},
				class: 'w-full'
			});
		};

		ProductMetricCard(node_5, {
			title: 'Users',
			subTitle: '4,420',
			changeProps: { size: "sm", value: -3.4, since: "Since last month" },
			chart,
			$$slots: { chart: true }
		});
	}

	var node_6 = $.sibling(node_5, 2);

	{
		const chart = ($$anchor) => {
			DarkChart($$anchor, {
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
		};

		ProductMetricCard(node_6, {
			title: 'Users',
			subTitle: '4,420',
			changeProps: { size: "sm", value: -3.4, since: "Since last month" },
			chart,
			$$slots: { chart: true }
		});
	}

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_7 = $.child(div_3);

	Chat(node_7, {});

	var div_4 = $.sibling(node_7, 2);
	var node_8 = $.child(div_4);

	{
		const chart = ($$anchor) => {
			Chart($$anchor, {
				get options() {
					return options;
				}
			});
		};

		CategorySalesReport(node_8, {
			title: 'Sales by category',
			subtitle: 'Desktop PC',
			changeProps: { value: 2.5, since: "Since last month", size: "sm" },
			chart,
			$$slots: { chart: true }
		});
	}

	var node_9 = $.sibling(node_8, 2);

	{
		const chart = ($$anchor) => {
			{
				let $0 = $.derived(() => trafficOptions(dark));

				Chart($$anchor, {
					get options() {
						return $.get($0);
					}
				});
			}
		};

		Traffic(node_9, {
			get devices() {
				return devices;
			},
			chart,
			$$slots: { chart: true }
		});
	}

	$.reset(div_4);
	$.reset(div_3);

	var div_5 = $.sibling(div_3, 2);
	var node_10 = $.child(div_5);

	{
		const actions = ($$anchor) => {
			var a = root_1();

			$.append($$anchor, a);
		};

		ActivityList(node_10, {
			title: 'Latest Activity',
			actions,
			children: ($$anchor, $$slotProps) => {
				Timeline($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_7 = root_6();
						var node_11 = $.first_child(fragment_7);

						TimelineItem(node_11, {
							title: 'Application UI design in Figma',
							date: 'April 2025',
							children: ($$anchor, $$slotProps) => {
								var fragment_8 = root_3();
								var node_12 = $.sibling($.first_child(fragment_8), 2);

								Button(node_12, {
									color: 'alternative',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var fragment_9 = root_2();
										var node_13 = $.sibling($.first_child(fragment_9));

										ArrowRightOutline(node_13, { class: 'ms-2', size: 'sm' });
										$.append($$anchor, fragment_9);
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_8);
							},
							$$slots: { default: true }
						});

						var node_14 = $.sibling(node_11, 2);

						TimelineItem(node_14, {
							title: 'Marketing UI code in Flowbite',
							date: 'March 2025',
							children: ($$anchor, $$slotProps) => {
								var fragment_10 = root_4();
								var a_1 = $.sibling($.first_child(fragment_10), 2);
								var node_15 = $.sibling($.child(a_1));

								ArrowRightOutline(node_15, { class: 'ms-2', size: 'sm' });
								$.reset(a_1);
								$.append($$anchor, fragment_10);
							},
							$$slots: { default: true }
						});

						var node_16 = $.sibling(node_14, 2);

						TimelineItem(node_16, {
							title: 'Marketing UI design in Figma',
							date: 'February 2025',
							children: ($$anchor, $$slotProps) => {
								var p = root_5();

								$.append($$anchor, p);
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_7);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { actions: true, default: true }
		});
	}

	var node_17 = $.sibling(node_10, 2);

	Insights(node_17, {});
	$.reset(div_5);

	var node_18 = $.sibling(div_5, 2);

	Transactions(node_18, { dark });
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}
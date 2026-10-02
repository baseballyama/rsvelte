import * as $ from 'svelte/internal/server';
import { Timeline, TimelineItem, P } from "flowbite-svelte";
import { CalendarWeekSolid, CheckCircleSolid, ClockSolid } from "flowbite-svelte-icons";
import dayjs from "dayjs";

export default function TimelineColor($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const pastDate = dayjs().subtract(3, "day").hour(14).minute(0).second(0).format("YYYY-MM-DDTHH:mm:ss");
		const currentDate = dayjs().hour(10).minute(0).second(0).format("YYYY-MM-DDTHH:mm:ss");
		const futureDate = dayjs().add(3, "day").hour(15).minute(30).second(0).format("YYYY-MM-DDTHH:mm:ss");
		const futureDate2 = dayjs().add(5, "day").hour(15).minute(30).second(0).format("YYYY-MM-DDTHH:mm:ss");

		const appointments = [
			{
				id: 1,
				title: "Team Meeting",
				date: pastDate,
				status: "completed",
				description: "Weekly team sync and project updates"
			},

			{
				id: 2,
				title: "Client Presentation",
				date: currentDate,
				status: "in-progress",
				description: "Present Q3 results to stakeholders"
			},

			{
				id: 3,
				title: "Product Demo",
				date: futureDate,
				status: "upcoming",
				description: "Demo new features to potential customers"
			},

			{
				id: 4,
				title: "Code Review",
				date: futureDate2,
				status: "upcoming",
				description: "Review pull requests and discuss architecture"
			}
		];

		const releases = [
			{
				title: "Flowbite Library v1.0.0",
				date: "Released on December 2nd, 2021",
				status: "completed",
				description: "Get started with dozens of web components and interactive elements."
			},

			{
				title: "Flowbite Library v1.2.0",
				date: "Released on December 23rd, 2021",
				status: "completed",
				description: "Added new components and improved accessibility."
			},

			{
				title: "Flowbite Library v2.0.0",
				date: "Coming Q1 2025",
				status: "upcoming",
				description: "Major overhaul with new design system and features."
			}
		];

		function getColorForStatus(status) {
			switch (status) {
				case "completed":
					return "green";

				case "in-progress":
					return "orange";

				case "upcoming":
					return "blue";

				case "cancelled":
					return "red";

				default:
					return "gray";
			}
		}

		function getIconForStatus(status) {
			switch (status) {
				case "completed":
					return CheckCircleSolid;

				case "in-progress":
					return ClockSolid;

				default:
					return CalendarWeekSolid;
			}
		}

		function getConnectorColor(status) {
			switch (status) {
				case "completed":
					return "bg-green-200 dark:bg-green-700";

				case "in-progress":
					return "bg-orange-200 dark:bg-orange-700";

				case "upcoming":
					return "bg-blue-200 dark:bg-blue-700";

				default:
					return "bg-gray-200 dark:bg-gray-700";
			}
		}

		P($$renderer, {
			class: 'my-4 text-xl font-semibold',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Example 1`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Timeline($$renderer, {
			order: 'vertical',
			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(appointments);

				for (let index = 0, $$length = each_array.length; index < $$length; index++) {
					let appointment = each_array[index];
					const isLastItem = index === appointments.length - 1;
					const itemColor = getColorForStatus(appointment.status);
					const IconComponent = getIconForStatus(appointment.status);

					{
						function orientationSlot($$renderer) {
							$$renderer.push(`<span${$.attr_class(`absolute -left-4 flex h-6 w-6 items-center justify-center rounded-full ring-8 ring-white dark:ring-gray-900 ${appointment.status === 'completed'
								? 'bg-green-200 dark:bg-green-900'
								: appointment.status === 'in-progress'
									? 'bg-orange-200 dark:bg-orange-900'
									: appointment.status === 'upcoming'
										? 'bg-blue-200 dark:bg-blue-900'
										: 'bg-gray-200 dark:bg-gray-900'}`)}>`);

							if (IconComponent) {
								$$renderer.push('<!--[-->');

								IconComponent($$renderer, {
									class: `h-4 w-4 ${appointment.status === 'completed'
										? 'text-green-600 dark:text-green-400'
										: appointment.status === 'in-progress'
											? 'text-orange-600 dark:text-orange-400'
											: appointment.status === 'upcoming'
												? 'text-blue-600 dark:text-blue-400'
												: 'text-gray-600 dark:text-gray-400'}`
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(`</span>`);
						}

						TimelineItem($$renderer, {
							title: appointment.title,
							date: appointment.date,
							color: itemColor,
							isLast: isLastItem,
							dateFormat: 'full-date',
							classes: { h3: "ml-4" },
							datePrefix: 'Released on',
							orientationSlot,
							children: ($$renderer) => {
								$$renderer.push(`<div class="pl-4"><p class="mb-2 text-base font-normal text-gray-500 dark:text-gray-400">${$.escape(appointment.description)}</p> <span${$.attr_class(`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${appointment.status === 'completed'
									? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
									: appointment.status === 'in-progress'
										? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
										: appointment.status === 'upcoming'
											? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
											: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'}`)}>${$.escape(appointment.status.replace("-", " "))}</span></div>`);
							},
							$$slots: { orientationSlot: true, default: true }
						});
					}
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		P($$renderer, {
			class: 'my-4 text-xl font-semibold',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Example 2`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Timeline($$renderer, {
			order: 'vertical',
			class: 'mt-8',
			children: ($$renderer) => {
				TimelineItem($$renderer, {
					title: 'Past Event',
					date: pastDate,
					color: 'green',
					dateFormat: 'full-date',
					datePrefix: 'Released on',
					children: ($$renderer) => {
						$$renderer.push(`<p class="pl-4 text-sm text-gray-500 dark:text-gray-400">This event has already happened</p>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				TimelineItem($$renderer, {
					title: 'Current Event',
					date: currentDate,
					color: 'orange',
					dateFormat: 'full-date',
					datePrefix: 'Released on',
					children: ($$renderer) => {
						$$renderer.push(`<p class="pl-4 text-sm text-gray-500 dark:text-gray-400">This event is happening now</p>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				TimelineItem($$renderer, {
					title: 'Future Event',
					date: futureDate,
					color: 'blue',
					isLast: true,
					dateFormat: 'full-date',
					datePrefix: 'Released on',
					children: ($$renderer) => {
						$$renderer.push(`<p class="pl-4 text-sm text-gray-500 dark:text-gray-400">This event will happen in the future</p>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		P($$renderer, {
			class: 'my-4 text-xl font-semibold',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Example 3`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Timeline($$renderer, {
			order: 'horizontal',
			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array_1 = $.ensure_array_like(releases);

				for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
					let release = each_array_1[index];
					const isLastItem = index === releases.length - 1;
					const itemColor = getColorForStatus(release.status);
					const connectorColor = getConnectorColor(release.status);

					{
						function orientationSlot($$renderer) {
							$$renderer.push(`<div class="flex items-center"><div${$.attr_class(`z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-0 ring-white sm:ring-8 dark:ring-gray-900 ${release.status === 'completed'
								? 'bg-green-200 dark:bg-green-900'
								: release.status === 'in-progress'
									? 'bg-orange-200 dark:bg-orange-900'
									: release.status === 'upcoming'
										? 'bg-blue-200 dark:bg-blue-900'
										: 'bg-gray-200 dark:bg-gray-900'}`)}>`);

							CalendarWeekSolid($$renderer, {
								class: `h-4 w-4 ${release.status === 'completed'
									? 'text-green-600 dark:text-green-400'
									: release.status === 'in-progress'
										? 'text-orange-600 dark:text-orange-400'
										: release.status === 'upcoming'
											? 'text-blue-600 dark:text-blue-400'
											: 'text-gray-600 dark:text-gray-400'}`
							});

							$$renderer.push(`<!----></div> `);

							if (!isLastItem) {
								$$renderer.push(`<!--[0--><div${$.attr_class(`hidden h-0.5 w-full sm:flex ${$.stringify(connectorColor)}`)}></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></div>`);
						}

						TimelineItem($$renderer, {
							title: release.title,
							date: release.date,
							color: itemColor,
							isLast: isLastItem,
							datePrefix: 'Released on',
							orientationSlot,
							children: ($$renderer) => {
								$$renderer.push(`<p class="text-base font-normal text-gray-500 dark:text-gray-400">${$.escape(release.description)}</p> <span${$.attr_class(`mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${release.status === 'completed'
									? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
									: release.status === 'in-progress'
										? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
										: release.status === 'upcoming'
											? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
											: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'}`)}>${$.escape(release.status.replace("-", " "))}</span>`);
							},
							$$slots: { orientationSlot: true, default: true }
						});
					}
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		P($$renderer, {
			class: 'my-4 text-xl font-semibold',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Example 4`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Timeline($$renderer, {
			order: 'horizontal',
			class: 'mt-8',
			children: ($$renderer) => {
				TimelineItem($$renderer, {
					title: 'Past Release',
					color: 'green',
					date: pastDate,
					children: ($$renderer) => {
						$$renderer.push(`<p class="text-base font-normal text-gray-500 dark:text-gray-400">This version was released successfully</p>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				TimelineItem($$renderer, {
					title: 'Current Development',
					color: 'orange',
					date: currentDate,
					children: ($$renderer) => {
						$$renderer.push(`<p class="text-base font-normal text-gray-500 dark:text-gray-400">This version is currently in development</p>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				TimelineItem($$renderer, {
					title: 'Future Release',
					color: 'blue',
					isLast: true,
					date: futureDate,
					children: ($$renderer) => {
						$$renderer.push(`<p class="text-base font-normal text-gray-500 dark:text-gray-400">This version is planned for the future</p>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}
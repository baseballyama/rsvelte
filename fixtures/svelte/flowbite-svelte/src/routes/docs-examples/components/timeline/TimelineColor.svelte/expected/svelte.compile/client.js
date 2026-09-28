import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Timeline, TimelineItem, P } from "flowbite-svelte";
import { CalendarWeekSolid, CheckCircleSolid, ClockSolid } from "flowbite-svelte-icons";
import dayjs from "dayjs";

var root = $.from_html(`<span><!></span>`);
var root_1 = $.from_html(`<div class="pl-4"><p class="mb-2 text-base font-normal text-gray-500 dark:text-gray-400"> </p> <span> </span></div>`);
var root_2 = $.from_html(`<p class="pl-4 text-sm text-gray-500 dark:text-gray-400">This event has already happened</p>`);
var root_3 = $.from_html(`<p class="pl-4 text-sm text-gray-500 dark:text-gray-400">This event is happening now</p>`);
var root_4 = $.from_html(`<p class="pl-4 text-sm text-gray-500 dark:text-gray-400">This event will happen in the future</p>`);
var root_5 = $.from_html(`<!> <!> <!>`, 1);
var root_6 = $.from_html(`<div></div>`);
var root_7 = $.from_html(`<div class="flex items-center"><div><!></div> <!></div>`);
var root_8 = $.from_html(`<p class="text-base font-normal text-gray-500 dark:text-gray-400"> </p> <span> </span>`, 1);
var root_9 = $.from_html(`<p class="text-base font-normal text-gray-500 dark:text-gray-400">This version was released successfully</p>`);
var root_10 = $.from_html(`<p class="text-base font-normal text-gray-500 dark:text-gray-400">This version is currently in development</p>`);
var root_11 = $.from_html(`<p class="text-base font-normal text-gray-500 dark:text-gray-400">This version is planned for the future</p>`);
var root_12 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function TimelineColor($$anchor, $$props) {
	$.push($$props, true);

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

	var fragment = root_12();
	var node = $.first_child(fragment);

	P(node, {
		class: 'my-4 text-xl font-semibold',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Example 1');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Timeline(node_1, {
		order: 'vertical',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node_2 = $.first_child(fragment_1);

			$.each(node_2, 17, () => appointments, $.index, ($$anchor, appointment, index) => {
				const isLastItem = $.derived(() => index === appointments.length - 1);
				const itemColor = $.derived(() => getColorForStatus($.get(appointment).status));
				const IconComponent = $.derived(() => getIconForStatus($.get(appointment).status));

				{
					const orientationSlot = ($$anchor) => {
						var span = root();
						var node_3 = $.child(span);

						{
							let $0 = $.derived(() => $.get(appointment).status === 'completed'
								? 'text-green-600 dark:text-green-400'
								: $.get(appointment).status === 'in-progress'
									? 'text-orange-600 dark:text-orange-400'
									: $.get(appointment).status === 'upcoming'
										? 'text-blue-600 dark:text-blue-400'
										: 'text-gray-600 dark:text-gray-400');

							$.component(node_3, () => $.get(IconComponent), ($$anchor, IconComponent_1) => {
								IconComponent_1($$anchor, {
									get class() {
										return `h-4 w-4 ${$.get($0) ?? ''}`;
									}
								});
							});
						}

						$.reset(span);

						$.template_effect(() => $.set_class(span, 1, `absolute -left-4 flex h-6 w-6 items-center justify-center rounded-full ring-8 ring-white dark:ring-gray-900 ${$.get(appointment).status === 'completed'
							? 'bg-green-200 dark:bg-green-900'
							: $.get(appointment).status === 'in-progress'
								? 'bg-orange-200 dark:bg-orange-900'
								: $.get(appointment).status === 'upcoming'
									? 'bg-blue-200 dark:bg-blue-900'
									: 'bg-gray-200 dark:bg-gray-900'}`));

						$.append($$anchor, span);
					};

					TimelineItem($$anchor, {
						get title() {
							return $.get(appointment).title;
						},

						get date() {
							return $.get(appointment).date;
						},

						get color() {
							return $.get(itemColor);
						},

						get isLast() {
							return $.get(isLastItem);
						},
						dateFormat: 'full-date',
						classes: { h3: "ml-4" },
						datePrefix: 'Released on',
						orientationSlot,
						children: ($$anchor, $$slotProps) => {
							var div = root_1();
							var p = $.child(div);
							var text_1 = $.only_child(p, true);
							var span_1 = $.sibling(p, 2);
							var text_2 = $.only_child(span_1, true);

							$.reset(div);

							$.template_effect(
								($0) => {
									$.set_text(text_1, $.get(appointment).description);

									$.set_class(span_1, 1, `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${$.get(appointment).status === 'completed'
										? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
										: $.get(appointment).status === 'in-progress'
											? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
											: $.get(appointment).status === 'upcoming'
												? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
												: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'}`);

									$.set_text(text_2, $0);
								},
								[() => $.get(appointment).status.replace("-", " ")]
							);

							$.append($$anchor, div);
						},
						$$slots: { orientationSlot: true, default: true }
					});
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_1, 2);

	P(node_4, {
		class: 'my-4 text-xl font-semibold',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Example 2');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Timeline(node_5, {
		order: 'vertical',
		class: 'mt-8',
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root_5();
			var node_6 = $.first_child(fragment_3);

			TimelineItem(node_6, {
				title: 'Past Event',
				get date() {
					return pastDate;
				},
				color: 'green',
				dateFormat: 'full-date',
				datePrefix: 'Released on',
				children: ($$anchor, $$slotProps) => {
					var p_1 = root_2();

					$.append($$anchor, p_1);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_6, 2);

			TimelineItem(node_7, {
				title: 'Current Event',
				get date() {
					return currentDate;
				},
				color: 'orange',
				dateFormat: 'full-date',
				datePrefix: 'Released on',
				children: ($$anchor, $$slotProps) => {
					var p_2 = root_3();

					$.append($$anchor, p_2);
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_7, 2);

			TimelineItem(node_8, {
				title: 'Future Event',
				get date() {
					return futureDate;
				},
				color: 'blue',
				isLast: true,
				dateFormat: 'full-date',
				datePrefix: 'Released on',
				children: ($$anchor, $$slotProps) => {
					var p_3 = root_4();

					$.append($$anchor, p_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_5, 2);

	P(node_9, {
		class: 'my-4 text-xl font-semibold',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Example 3');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_9, 2);

	Timeline(node_10, {
		order: 'horizontal',
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = $.comment();
			var node_11 = $.first_child(fragment_4);

			$.each(node_11, 17, () => releases, $.index, ($$anchor, release, index) => {
				const isLastItem = $.derived(() => index === releases.length - 1);
				const itemColor = $.derived(() => getColorForStatus($.get(release).status));
				const connectorColor = $.derived(() => getConnectorColor($.get(release).status));

				{
					const orientationSlot = ($$anchor) => {
						var div_1 = root_7();
						var div_2 = $.child(div_1);
						var node_12 = $.child(div_2);

						{
							let $0 = $.derived(() => $.get(release).status === 'completed'
								? 'text-green-600 dark:text-green-400'
								: $.get(release).status === 'in-progress'
									? 'text-orange-600 dark:text-orange-400'
									: $.get(release).status === 'upcoming'
										? 'text-blue-600 dark:text-blue-400'
										: 'text-gray-600 dark:text-gray-400');

							CalendarWeekSolid(node_12, {
								get class() {
									return `h-4 w-4 ${$.get($0) ?? ''}`;
								}
							});
						}

						$.reset(div_2);

						var node_13 = $.sibling(div_2, 2);

						{
							var consequent = ($$anchor) => {
								var div_3 = root_6();

								$.template_effect(() => $.set_class(div_3, 1, `hidden h-0.5 w-full sm:flex ${$.get(connectorColor) ?? ''}`));
								$.append($$anchor, div_3);
							};

							$.if(node_13, ($$render) => {
								if (!$.get(isLastItem)) $$render(consequent);
							});
						}

						$.reset(div_1);

						$.template_effect(() => $.set_class(div_2, 1, `z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-0 ring-white sm:ring-8 dark:ring-gray-900 ${$.get(release).status === 'completed'
							? 'bg-green-200 dark:bg-green-900'
							: $.get(release).status === 'in-progress'
								? 'bg-orange-200 dark:bg-orange-900'
								: $.get(release).status === 'upcoming'
									? 'bg-blue-200 dark:bg-blue-900'
									: 'bg-gray-200 dark:bg-gray-900'}`));

						$.append($$anchor, div_1);
					};

					TimelineItem($$anchor, {
						get title() {
							return $.get(release).title;
						},

						get date() {
							return $.get(release).date;
						},

						get color() {
							return $.get(itemColor);
						},

						get isLast() {
							return $.get(isLastItem);
						},
						datePrefix: 'Released on',
						orientationSlot,
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root_8();
							var p_4 = $.first_child(fragment_6);
							var text_5 = $.only_child(p_4, true);
							var span_2 = $.sibling(p_4, 2);
							var text_6 = $.only_child(span_2, true);

							$.template_effect(
								($0) => {
									$.set_text(text_5, $.get(release).description);

									$.set_class(span_2, 1, `mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${$.get(release).status === 'completed'
										? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
										: $.get(release).status === 'in-progress'
											? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
											: $.get(release).status === 'upcoming'
												? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
												: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'}`);

									$.set_text(text_6, $0);
								},
								[() => $.get(release).status.replace("-", " ")]
							);

							$.append($$anchor, fragment_6);
						},
						$$slots: { orientationSlot: true, default: true }
					});
				}
			});

			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	var node_14 = $.sibling(node_10, 2);

	P(node_14, {
		class: 'my-4 text-xl font-semibold',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_7 = $.text('Example 4');

			$.append($$anchor, text_7);
		},
		$$slots: { default: true }
	});

	var node_15 = $.sibling(node_14, 2);

	Timeline(node_15, {
		order: 'horizontal',
		class: 'mt-8',
		children: ($$anchor, $$slotProps) => {
			var fragment_7 = root_5();
			var node_16 = $.first_child(fragment_7);

			TimelineItem(node_16, {
				title: 'Past Release',
				color: 'green',
				get date() {
					return pastDate;
				},

				children: ($$anchor, $$slotProps) => {
					var p_5 = root_9();

					$.append($$anchor, p_5);
				},
				$$slots: { default: true }
			});

			var node_17 = $.sibling(node_16, 2);

			TimelineItem(node_17, {
				title: 'Current Development',
				color: 'orange',
				get date() {
					return currentDate;
				},

				children: ($$anchor, $$slotProps) => {
					var p_6 = root_10();

					$.append($$anchor, p_6);
				},
				$$slots: { default: true }
			});

			var node_18 = $.sibling(node_17, 2);

			TimelineItem(node_18, {
				title: 'Future Release',
				color: 'blue',
				isLast: true,
				get date() {
					return futureDate;
				},

				children: ($$anchor, $$slotProps) => {
					var p_7 = root_11();

					$.append($$anchor, p_7);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_7);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}
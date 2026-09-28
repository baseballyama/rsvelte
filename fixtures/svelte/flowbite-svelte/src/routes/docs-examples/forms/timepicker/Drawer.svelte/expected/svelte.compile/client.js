import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Button,
	Drawer,
	Label,
	Select,
	Toggle,
	Checkbox,
	Timepicker,
	Card,
	P,
	Heading,
	Span
} from "flowbite-svelte";

import { InfoCircleSolid, ClockSolid, PlusOutline, TrashBinSolid } from "flowbite-svelte-icons";

var root = $.from_html(`<!> Set Time Schedule`, 1);
var root_1 = $.from_html(`<!> Time schedule`, 1);
var root_2 = $.from_html(`<div class="flex items-center justify-between"><div><!> <!></div> <!></div>`);
var root_3 = $.from_html(`Timezone <!>`, 1);
var root_4 = $.from_html(`<div class="flex flex-col gap-2 rounded-lg bg-white p-2 shadow-sm transition-shadow hover:shadow-md dark:bg-gray-700"><div class="flex min-w-[65px] items-center"><!></div> <div class="flex flex-1 items-center"><!> <!></div></div>`);
var root_5 = $.from_html(`<!> Add Working Day`, 1);
var root_6 = $.from_html(`<!> <form class="space-y-8"><!> <div class="space-y-2"><!> <!></div> <div class="space-y-2 sm:space-y-4"></div> <!> <div class="flex gap-4"><!> <!></div></form>`, 1);
var root_7 = $.from_html(`<div class="flex justify-center"><!></div> <!>`, 1);

export default function Drawer_1($$anchor, $$props) {
	$.push($$props, true);

	let open = $.state(false);
	let businessHoursEnabled = $.state(true);
	let selectedTimezoneDrawer = $.state("");

	let workingDays = $.state($.proxy([
		{
			day: "Mon",
			enabled: true,
			startTime: "09:00",
			endTime: "17:00"
		},

		{
			day: "Tue",
			enabled: false,
			startTime: "09:00",
			endTime: "17:00"
		},

		{
			day: "Wed",
			enabled: true,
			startTime: "09:00",
			endTime: "17:00"
		},

		{
			day: "Thu",
			enabled: false,
			startTime: "09:00",
			endTime: "17:00"
		},

		{
			day: "Fri",
			enabled: false,
			startTime: "09:00",
			endTime: "17:00"
		}
	]));

	const drawerTimezones = [
		{
			value: "America/New_York",
			name: "EST (Eastern Standard Time) - GMT-5 (New York)"
		},

		{
			value: "America/Los_Angeles",
			name: "PST (Pacific Standard Time) - GMT-8 (Los Angeles)"
		},

		{
			value: "Europe/London",
			name: "GMT (Greenwich Mean Time) - GMT+0 (London)"
		},

		{
			value: "Europe/Berlin",
			name: "CET (Central European Time) - GMT+1 (Berlin)"
		},

		{
			value: "Asia/Tokyo",
			name: "JST (Japan Standard Time) - GMT+9 (Tokyo)"
		}
	];

	let sortedWorkingDays = $.derived(() => [...$.get(workingDays)].sort((a, b) => {
		const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

		return days.indexOf(a.day) - days.indexOf(b.day);
	}));

	function toggleDay(index) {
		$.get(workingDays)[index].enabled = !$.get(workingDays)[index].enabled;
		$.set(workingDays, [...$.get(workingDays)], true);
	}

	function handleTimeChange(index, isStartTime, event) {
		const newTime = isStartTime ? event.time : event.endTime;

		if (isStartTime) {
			$.get(workingDays)[index].startTime = newTime;
		} else {
			$.get(workingDays)[index].endTime = newTime;
		}

		$.set(workingDays, [...$.get(workingDays)], true);
	}

	function addInterval() {
		const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
		const existingDays = new Set($.get(workingDays).map((d) => d.day));
		const availableDays = days.filter((d) => !existingDays.has(d));

		if (availableDays.length > 0) {
			$.set(
				workingDays,
				[
					...$.get(workingDays),
					{
						day: availableDays[0],
						enabled: true,
						startTime: "09:00",
						endTime: "17:00"
					}
				],
				true
			);
		}
	}

	function removeInterval(index) {
		$.set(workingDays, $.get(workingDays).filter((_, i) => i !== index), true);
	}

	function saveAll(e) {
		e.preventDefault();

		console.log("Saving settings:", {
			businessHoursEnabled: $.get(businessHoursEnabled),
			selectedTimezoneDrawer: $.get(selectedTimezoneDrawer),
			workingDays: $.get(workingDays)
		});

		$.set(open, false);
	}

	const timepickerClasses = {
		divClass: "inline-flex rounded-lg shadow-sm text-xs sm:text-sm w-full sm:w-auto",
		inputClass: "block disabled:cursor-not-allowed disabled:opacity-50 p-1.5 sm:p-2.5 text-xs sm:text-sm border-r-0 focus:ring-0 focus:outline-none"
	};

	var fragment = root_7();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Button(node, {
		onclick: () => $.set(open, true),
		class: 'transform transition-all hover:scale-105',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			ClockSolid(node_1, { class: 'me-2 h-4 w-4' });
			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var node_2 = $.sibling(div, 2);

	Drawer(node_2, {
		class: 'w-96 bg-gray-50 p-6 dark:bg-gray-800',
		get open() {
			return $.get(open);
		},

		set open($$value) {
			$.set(open, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_6();
			var node_3 = $.first_child(fragment_2);

			Heading(node_3, {
				tag: 'h5',
				id: 'drawer-label',
				class: 'mb-8 inline-flex items-center text-base font-semibold text-gray-800 uppercase dark:text-white',
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_1();
					var node_4 = $.first_child(fragment_3);

					ClockSolid(node_4, { class: 'h-6 w-6' });
					$.next();
					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var form = $.sibling(node_3, 2);
			var node_5 = $.child(form);

			Card(node_5, {
				class: 'p-4 transition-shadow hover:shadow-lg',
				children: ($$anchor, $$slotProps) => {
					var div_1 = root_2();
					var div_2 = $.child(div_1);
					var node_6 = $.child(div_2);

					Heading(node_6, {
						tag: 'h6',
						class: 'text-lg font-semibold text-gray-900 dark:text-white',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Business Hours');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_7 = $.sibling(node_6, 2);

					P(node_7, {
						class: 'text-sm',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Enable or disable business hours scheduling');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.reset(div_2);

					var node_8 = $.sibling(div_2, 2);

					Toggle(node_8, {
						class: 'scale-110',
						get checked() {
							return $.get(businessHoursEnabled);
						},

						set checked($$value) {
							$.set(businessHoursEnabled, $$value, true);
						}
					});

					$.reset(div_1);
					$.append($$anchor, div_1);
				},
				$$slots: { default: true }
			});

			var div_3 = $.sibling(node_5, 2);
			var node_9 = $.child(div_3);

			Label(node_9, {
				for: 'timezones',
				class: 'flex items-center gap-2 text-lg',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_4 = root_3();
					var node_10 = $.sibling($.first_child(fragment_4));

					InfoCircleSolid(node_10, { class: 'h-4 w-4 cursor-help text-gray-400' });
					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			var node_11 = $.sibling(node_9, 2);

			Select(node_11, {
				id: 'timezones',
				get items() {
					return drawerTimezones;
				},
				class: 'w-full',
				get value() {
					return $.get(selectedTimezoneDrawer);
				},

				set value($$value) {
					$.set(selectedTimezoneDrawer, $$value, true);
				}
			});

			$.reset(div_3);

			var div_4 = $.sibling(div_3, 2);

			$.each(div_4, 23, () => $.get(sortedWorkingDays), ({ day, enabled, startTime, endTime }) => day, ($$anchor, $$item, index) => {
				let day = () => $.get($$item).day;
				let enabled = () => $.get($$item).enabled;
				let startTime = () => $.get($$item).startTime;
				let endTime = () => $.get($$item).endTime;
				var div_5 = root_4();
				var div_6 = $.child(div_5);
				var node_12 = $.child(div_6);

				Checkbox(node_12, {
					onchange: () => toggleDay($.get(index)),
					get checked() {
						return enabled();
					},
					class: 'scale-100',
					children: ($$anchor, $$slotProps) => {
						Span($$anchor, {
							class: 'ml-2 truncate text-sm',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_2 = $.text();

								$.template_effect(() => $.set_text(text_2, day()));
								$.append($$anchor, text_2);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$.reset(div_6);

				var div_7 = $.sibling(div_6, 2);
				var node_13 = $.child(div_7);

				Timepicker(node_13, {
					type: 'range',
					get value() {
						return startTime();
					},

					get endValue() {
						return endTime();
					},
					onselect: (e) => handleTimeChange($.get(index), true, e),
					get divClass() {
						return timepickerClasses.divClass;
					},

					get inputClass() {
						return timepickerClasses.inputClass;
					},
					size: 'sm'
				});

				var node_14 = $.sibling(node_13, 2);

				Button(node_14, {
					color: 'red',
					size: 'xs',
					pill: true,
					onclick: () => removeInterval($.get(index)),
					class: 'shrink-0 p-2 hover:bg-red-600',
					children: ($$anchor, $$slotProps) => {
						TrashBinSolid($$anchor, { class: 'h-2 w-2 sm:h-3 sm:w-3' });
					},
					$$slots: { default: true }
				});

				$.reset(div_7);
				$.reset(div_5);
				$.append($$anchor, div_5);
			});

			$.reset(div_4);

			var node_15 = $.sibling(div_4, 2);

			{
				let $0 = $.derived(() => $.get(workingDays).length >= 7);

				Button(node_15, {
					type: 'button',
					class: 'w-full transition-all hover:shadow-lg',
					color: 'alternative',
					onclick: addInterval,
					get disabled() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_8 = root_5();
						var node_16 = $.first_child(fragment_8);

						PlusOutline(node_16, { class: 'me-2 h-5 w-5' });
						$.next();
						$.append($$anchor, fragment_8);
					},
					$$slots: { default: true }
				});
			}

			var div_8 = $.sibling(node_15, 2);
			var node_17 = $.child(div_8);

			Button(node_17, {
				class: 'w-1/2',
				color: 'alternative',
				onclick: () => $.set(open, false),
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Cancel');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			var node_18 = $.sibling(node_17, 2);

			Button(node_18, {
				type: 'submit',
				class: 'w-1/2',
				color: 'primary',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Save Changes');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			$.reset(div_8);
			$.reset(form);
			$.event('submit', form, saveAll);
			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}
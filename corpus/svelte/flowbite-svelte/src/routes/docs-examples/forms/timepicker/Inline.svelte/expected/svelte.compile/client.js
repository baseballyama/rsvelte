import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Label,
	Datepicker,
	Timepicker,
	Button,
	Accordion,
	AccordionItem,
	Avatar,
	Input
} from "flowbite-svelte";

import { CalendarMonthSolid, ClockSolid, MapPinSolid } from "flowbite-svelte-icons";

var root = $.from_html(`<div class="space-y-4 p-4"><div><!> <!></div> <div><!> <!></div> <div><!> <!></div> <div><!> <!></div></div>`);
var root_1 = $.from_html(`<div class="mx-auto max-w-2xl rounded-lg bg-white shadow-md dark:bg-gray-800"><div class="p-6"><h2 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white"> </h2> <div class="mb-6 flex flex-wrap gap-4"><div class="flex items-center"><!> <span class="text-gray-900 dark:text-white"> </span></div> <div class="flex items-center"><!> <span class="text-gray-900 dark:text-white"> </span></div> <div class="flex items-center"><!> <span class="text-gray-900 dark:text-white"> </span></div></div> <div class="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3"><div><!> <div class="flex -space-x-4"><!> <!></div></div> <div><!> <span class="text-lg font-medium text-gray-900 dark:text-white"> </span></div> <div><!> <span class="text-lg font-medium text-gray-900 dark:text-white"> </span></div></div> <div class="border-t border-gray-200 pt-6 dark:border-gray-700"><div class="grid grid-cols-1 gap-6 md:grid-cols-2"><div><!> <!></div> <div><!> <!></div></div></div></div> <!> <div class="border-t border-gray-200 p-6 dark:border-gray-700"><!></div></div>`);

export default function Inline($$anchor, $$props) {
	$.push($$props, true);

	let selectedDate = $.state($.proxy(new Date("2024-06-30")));
	let selectedInlineTime = $.state($.proxy({ time: "12:00" }));
	let eventTitle = $.state("Digital Transformation");
	let eventLocation = $.state("California, USA");
	let eventDuration = $.state("30 min");
	let eventType = $.state("Web conference");

	let participants = [
		{ img: "/images/profile-picture-1.webp", alt: "Participant 1" },
		{ img: "/images/profile-picture-2.webp", alt: "Participant 2" },
		{ img: "/images/profile-picture-3.webp", alt: "Participant 3" }
	];

	const timeIntervals = [
		"10:00",
		"10:30",
		"11:00",
		"11:30",
		"12:00",
		"12:30",
		"13:00",
		"13:30",
		"14:00",
		"14:30",
		"15:00",
		"15:30"
	];

	function handleTimeSelect(data) {
		if (data) {
			$.set(selectedInlineTime, { time: data.time }, true);
		}
	}

	var div = root_1();
	var div_1 = $.child(div);
	var h2 = $.child(div_1);
	var text = $.only_child(h2, true);
	var div_2 = $.sibling(h2, 2);
	var div_3 = $.child(div_2);
	var node = $.child(div_3);

	CalendarMonthSolid(node, { class: 'mr-2 h-5 w-5 text-gray-500 dark:text-gray-400' });

	var span = $.sibling(node, 2);
	var text_1 = $.only_child(span, true);

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_1 = $.child(div_4);

	ClockSolid(node_1, { class: 'mr-2 h-5 w-5 text-gray-500 dark:text-gray-400' });

	var span_1 = $.sibling(node_1, 2);
	var text_2 = $.only_child(span_1, true);

	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node_2 = $.child(div_5);

	MapPinSolid(node_2, { class: 'mr-2 h-5 w-5 text-gray-500 dark:text-gray-400' });

	var span_2 = $.sibling(node_2, 2);
	var text_3 = $.only_child(span_2, true);

	$.reset(div_5);
	$.reset(div_2);

	var div_6 = $.sibling(div_2, 2);
	var div_7 = $.child(div_6);
	var node_3 = $.child(div_7);

	Label(node_3, {
		class: 'mb-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Participants');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var div_8 = $.sibling(node_3, 2);
	var node_4 = $.child(div_8);

	$.each(node_4, 17, () => participants, $.index, ($$anchor, participant) => {
		Avatar($$anchor, {
			get src() {
				return $.get(participant).img;
			},

			get alt() {
				return $.get(participant).alt;
			}
		});
	});

	var node_5 = $.sibling(node_4, 2);

	Avatar(node_5, {
		class: 'bg-gray-700 text-white',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('+99');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	$.reset(div_8);
	$.reset(div_7);

	var div_9 = $.sibling(div_7, 2);
	var node_6 = $.child(div_9);

	Label(node_6, {
		class: 'mb-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_6 = $.text('Duration');

			$.append($$anchor, text_6);
		},
		$$slots: { default: true }
	});

	var span_3 = $.sibling(node_6, 2);
	var text_7 = $.only_child(span_3, true);

	$.reset(div_9);

	var div_10 = $.sibling(div_9, 2);
	var node_7 = $.child(div_10);

	Label(node_7, {
		class: 'mb-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_8 = $.text('Meeting Type');

			$.append($$anchor, text_8);
		},
		$$slots: { default: true }
	});

	var span_4 = $.sibling(node_7, 2);
	var text_9 = $.only_child(span_4, true);

	$.reset(div_10);
	$.reset(div_6);

	var div_11 = $.sibling(div_6, 2);
	var div_12 = $.child(div_11);
	var div_13 = $.child(div_12);
	var node_8 = $.child(div_13);

	Label(node_8, {
		class: 'mb-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_10 = $.text('Select Date');

			$.append($$anchor, text_10);
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_8, 2);

	Datepicker(node_9, {
		inline: true,
		get value() {
			return $.get(selectedDate);
		},

		set value($$value) {
			$.set(selectedDate, $$value, true);
		}
	});

	$.reset(div_13);

	var div_14 = $.sibling(div_13, 2);
	var node_10 = $.child(div_14);

	Label(node_10, {
		class: 'mb-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_11 = $.text('Select Time');

			$.append($$anchor, text_11);
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node_10, 2);

	Timepicker(node_11, {
		type: 'inline-buttons',
		get value() {
			return $.get(selectedInlineTime).time;
		},

		get timeIntervals() {
			return timeIntervals;
		},
		onselect: handleTimeSelect
	});

	$.reset(div_14);
	$.reset(div_12);
	$.reset(div_11);
	$.reset(div_1);

	var node_12 = $.sibling(div_1, 2);

	Accordion(node_12, {
		flush: true,
		children: ($$anchor, $$slotProps) => {
			{
				const header = ($$anchor) => {
					$.next();

					var text_12 = $.text('Additional Options');

					$.append($$anchor, text_12);
				};

				AccordionItem($$anchor, {
					class: 'p-2',
					header,
					children: ($$anchor, $$slotProps) => {
						var div_15 = root();
						var div_16 = $.child(div_15);
						var node_13 = $.child(div_16);

						Label(node_13, {
							for: 'event-title',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_13 = $.text('Event Title');

								$.append($$anchor, text_13);
							},
							$$slots: { default: true }
						});

						var node_14 = $.sibling(node_13, 2);

						Input(node_14, {
							id: 'event-title',
							get value() {
								return $.get(eventTitle);
							},

							set value($$value) {
								$.set(eventTitle, $$value, true);
							}
						});

						$.reset(div_16);

						var div_17 = $.sibling(div_16, 2);
						var node_15 = $.child(div_17);

						Label(node_15, {
							for: 'event-location',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_14 = $.text('Location');

								$.append($$anchor, text_14);
							},
							$$slots: { default: true }
						});

						var node_16 = $.sibling(node_15, 2);

						Input(node_16, {
							id: 'event-location',
							get value() {
								return $.get(eventLocation);
							},

							set value($$value) {
								$.set(eventLocation, $$value, true);
							}
						});

						$.reset(div_17);

						var div_18 = $.sibling(div_17, 2);
						var node_17 = $.child(div_18);

						Label(node_17, {
							for: 'event-duration',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_15 = $.text('Duration');

								$.append($$anchor, text_15);
							},
							$$slots: { default: true }
						});

						var node_18 = $.sibling(node_17, 2);

						Input(node_18, {
							id: 'event-duration',
							get value() {
								return $.get(eventDuration);
							},

							set value($$value) {
								$.set(eventDuration, $$value, true);
							}
						});

						$.reset(div_18);

						var div_19 = $.sibling(div_18, 2);
						var node_19 = $.child(div_19);

						Label(node_19, {
							for: 'event-type',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_16 = $.text('Meeting Type');

								$.append($$anchor, text_16);
							},
							$$slots: { default: true }
						});

						var node_20 = $.sibling(node_19, 2);

						Input(node_20, {
							id: 'event-type',
							get value() {
								return $.get(eventType);
							},

							set value($$value) {
								$.set(eventType, $$value, true);
							}
						});

						$.reset(div_19);
						$.reset(div_15);
						$.append($$anchor, div_15);
					},
					$$slots: { header: true, default: true }
				});
			}
		},
		$$slots: { default: true }
	});

	var div_20 = $.sibling(node_12, 2);
	var node_21 = $.child(div_20);

	Button(node_21, {
		color: 'primary',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_17 = $.text('Schedule Event');

			$.append($$anchor, text_17);
		},
		$$slots: { default: true }
	});

	$.reset(div_20);
	$.reset(div);

	$.template_effect(
		($0) => {
			$.set_text(text, $.get(eventTitle));
			$.set_text(text_1, $0);
			$.set_text(text_2, $.get(selectedInlineTime).time);
			$.set_text(text_3, $.get(eventLocation));
			$.set_text(text_7, $.get(eventDuration));
			$.set_text(text_9, $.get(eventType));
		},
		[
			() => $.get(selectedDate).toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" })
		]
	);

	$.append($$anchor, div);
	$.pop();
}
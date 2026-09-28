import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Modal, Label, Datepicker, Timepicker, Heading, P } from "flowbite-svelte";
import { ClockSolid } from "flowbite-svelte-icons";

var root = $.from_html(`<!> Schedule appointment`, 1);
var root_1 = $.from_html(`<div class="p-4 sm:p-5"><div class="mb-4"><!></div> <div class="mb-4"><!> <!></div> <div class="flex items-center space-x-4"><!> <!></div></div>`);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function Modal_1($$anchor, $$props) {
	$.push($$props, true);

	let open = $.state(false);
	let modalSelectedDate = $.state($.proxy(new Date()));
	let modalTimeSelection = $.state($.proxy({ time: "10:00", endTime: "11:00" }));

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

	function handleModalDateSelect(selectedDate) {
		if (selectedDate instanceof Date) {
			$.set(modalSelectedDate, selectedDate, true);
		} else if (selectedDate && typeof selectedDate === "object") {
			// Handle range case if needed
			if (selectedDate.from) {
				$.set(modalSelectedDate, selectedDate.from, true);
			}
		}
	}

	function handleModalTimeSelect(data) {
		if (data) {
			$.set(modalTimeSelection, { time: data.time, endTime: data.endTime }, true);
		}
	}

	function handleSave() {
		$.set(open, false);
	}

	var fragment = root_2();
	var node = $.first_child(fragment);

	Button(node, {
		onclick: () => $.set(open, true),
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			ClockSolid(node_1, { class: 'me-2 h-4 w-4' });
			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			P($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text();

					$.template_effect(($0) => $.set_text(text, `Appointment scheduled for ${$0 ?? ''} at ${$.get(modalTimeSelection).time ?? ''}`), [() => $.get(modalSelectedDate).toDateString()]);
					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		};

		$.if(node_2, ($$render) => {
			if ($.get(modalTimeSelection)) $$render(consequent);
		});
	}

	var node_3 = $.sibling(node_2, 2);

	{
		const header = ($$anchor) => {
			Heading($$anchor, {
				tag: 'h5',
				class: 'mb-4 font-medium text-gray-900 dark:text-white',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Schedule an appointment');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});
		};

		Modal(node_3, {
			class: 'w-full max-w-[23rem]',
			get open() {
				return $.get(open);
			},

			set open($$value) {
				$.set(open, $$value, true);
			},
			header,
			children: ($$anchor, $$slotProps) => {
				var div = root_1();
				var div_1 = $.child(div);
				var node_4 = $.child(div_1);

				Datepicker(node_4, {
					onselect: handleModalDateSelect,
					inline: true,
					class: 'mx-auto [&_div>button]:bg-gray-50 [&>div>div]:bg-gray-50 [&>div>div]:shadow-none',
					get value() {
						return $.get(modalSelectedDate);
					},

					set value($$value) {
						$.set(modalSelectedDate, $$value, true);
					}
				});

				$.reset(div_1);

				var div_2 = $.sibling(div_1, 2);
				var node_5 = $.child(div_2);

				Label(node_5, {
					class: 'mb-2 block',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text('Pick your time');

						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});

				var node_6 = $.sibling(node_5, 2);

				Timepicker(node_6, {
					type: 'inline-buttons',
					get value() {
						return $.get(modalTimeSelection).time;
					},

					get timeIntervals() {
						return timeIntervals;
					},
					onselect: handleModalTimeSelect,
					columns: 3
				});

				$.reset(div_2);

				var div_3 = $.sibling(div_2, 2);
				var node_7 = $.child(div_3);

				Button(node_7, {
					color: 'primary',
					class: 'w-full',
					onclick: handleSave,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_3 = $.text('Save');

						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});

				var node_8 = $.sibling(node_7, 2);

				Button(node_8, {
					color: 'alternative',
					class: 'w-full',
					onclick: () => $.set(open, false),
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_4 = $.text('Discard');

						$.append($$anchor, text_4);
					},
					$$slots: { default: true }
				});

				$.reset(div_3);
				$.reset(div);
				$.append($$anchor, div);
			},
			$$slots: { header: true, default: true }
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}
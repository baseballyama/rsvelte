import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CalendarDate } from "@internationalized/date";
import * as Select from "$lib/registry/ui/select/index.js";
import Calendar from "$lib/registry/ui/calendar/calendar.svelte";
import { Label } from "$lib/registry/ui/label/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex flex-col gap-4"><!> <div class="flex flex-col gap-3"><!> <!></div></div>`);

export default function Calendar_13($$anchor, $$props) {
	const id = $.props_id();

	$.push($$props, true);

	let value = $.state($.proxy(new CalendarDate(2025, 6, 12)));
	let dropdown = $.state("dropdown");

	const dropdownOptions = [
		{ label: "Month and Year", value: "dropdown" },
		{ label: "Month Only", value: "dropdown-months" },
		{ label: "Year Only", value: "dropdown-years" }
	];

	const selectedDropdown = $.derived(() => dropdownOptions.find((option) => option.value === $.get(dropdown))?.label ?? "Dropdown");
	var div = root_1();
	var node = $.child(div);

	Calendar(node, {
		type: 'single',
		class: 'rounded-lg border shadow-sm',
		get captionLayout() {
			return $.get(dropdown);
		},

		get value() {
			return $.get(value);
		},

		set value($$value) {
			$.set(value, $$value, true);
		}
	});

	var div_1 = $.sibling(node, 2);
	var node_1 = $.child(div_1);

	Label(node_1, {
		get for() {
			return `${id}-dropdown`;
		},
		class: 'px-1',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Dropdown');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => Select.Root, ($$anchor, Select_Root) => {
		Select_Root($$anchor, {
			type: 'single',
			get value() {
				return $.get(dropdown);
			},

			set value($$value) {
				$.set(dropdown, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_3 = $.first_child(fragment);

				$.component(node_3, () => Select.Trigger, ($$anchor, Select_Trigger) => {
					Select_Trigger($$anchor, {
						get id() {
							return `${id}-dropdown`;
						},
						size: 'sm',
						class: 'w-full bg-background',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text();

							$.template_effect(() => $.set_text(text_1, $.get(selectedDropdown)));
							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				});

				var node_4 = $.sibling(node_3, 2);

				$.component(node_4, () => Select.Content, ($$anchor, Select_Content) => {
					Select_Content($$anchor, {
						align: 'center',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_5 = $.first_child(fragment_2);

							$.each(node_5, 17, () => dropdownOptions, (option) => option.value, ($$anchor, option) => {
								var fragment_3 = $.comment();
								var node_6 = $.first_child(fragment_3);

								$.component(node_6, () => Select.Item, ($$anchor, Select_Item) => {
									Select_Item($$anchor, {
										get value() {
											return $.get(option).value;
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text();

											$.template_effect(() => $.set_text(text_2, $.get(option).label));
											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_3);
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}
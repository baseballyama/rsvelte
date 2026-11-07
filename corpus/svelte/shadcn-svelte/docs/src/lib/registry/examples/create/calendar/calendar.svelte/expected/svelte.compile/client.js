import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CalendarBookedDates from "./calendar-booked-dates.svelte";
import CalendarCustomDays from "./calendar-custom-days.svelte";
import CalendarInCard from "./calendar-in-card.svelte";
import CalendarInPopover from "./calendar-in-popover.svelte";
import CalendarMultiple from "./calendar-multiple.svelte";
import CalendarRangeMultipleMonths from "./calendar-range-multiple-months.svelte";
import CalendarRange from "./calendar-range.svelte";
import CalendarSingle from "./calendar-single.svelte";
import CalendarWeekNumbers from "./calendar-week-numbers.svelte";
import CalendarWithPresets from "./calendar-with-presets.svelte";
import CalendarWithTime from "./calendar-with-time.svelte";
import DatePickerSimple from "./date-picker-simple.svelte";
import DataPickerWithDropdowns from "./date-picker-with-dropdowns.svelte";
import DatePickerWithRange from "./date-picker-with-range.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Calendar($$anchor) {
	ExampleWrapper($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			CalendarSingle(node, {});

			var node_1 = $.sibling(node, 2);

			CalendarMultiple(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			CalendarWeekNumbers(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			CalendarBookedDates(node_3, {});

			var node_4 = $.sibling(node_3, 2);

			CalendarRange(node_4, {});

			var node_5 = $.sibling(node_4, 2);

			CalendarRangeMultipleMonths(node_5, {});

			var node_6 = $.sibling(node_5, 2);

			CalendarWithTime(node_6, {});

			var node_7 = $.sibling(node_6, 2);

			CalendarWithPresets(node_7, {});

			var node_8 = $.sibling(node_7, 2);

			CalendarCustomDays(node_8, {});

			var node_9 = $.sibling(node_8, 2);

			DatePickerSimple(node_9, {});

			var node_10 = $.sibling(node_9, 2);

			DataPickerWithDropdowns(node_10, {});

			var node_11 = $.sibling(node_10, 2);

			DatePickerWithRange(node_11, {});

			var node_12 = $.sibling(node_11, 2);

			CalendarInCard(node_12, {});

			var node_13 = $.sibling(node_12, 2);

			CalendarInPopover(node_13, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}
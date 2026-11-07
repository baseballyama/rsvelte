import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useSearchParams } from "$lib/utilities/use-search-params/use-search-params.svelte";
import { z } from "zod";

var root = $.from_html(`<div><h1>Zod Codec Test Page</h1> <div class="controls svelte-nopl95"><input data-testid="filter-input" placeholder="Filter..."/> <button data-testid="setCreatedAt">Set createdAt</button> <button data-testid="setUpdatedAt">Set updatedAt</button> <button data-testid="reset">Reset</button></div> <div class="output svelte-nopl95"><div><strong>Filter:</strong> <span data-testid="filter"> </span></div> <div><strong>CreatedAt (date-only format):</strong> <span data-testid="createdAt"> </span></div> <div><strong>UpdatedAt (datetime format):</strong> <span data-testid="updatedAt"> </span></div></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	// Create a codec that converts between ISO date string (YYYY-MM-DD) and Date object
	const stringToDate = z.codec(
		z.iso.date(), // input schema: ISO date string (YYYY-MM-DD only)
		z.date(), // output schema: Date object
		{
			decode: (isoString) => new Date(isoString), // ISO string → Date
			encode: (date) => date.toISOString().split("T")[0] // Date → YYYY-MM-DD
		}
	);

	// Create a codec for full datetime
	const stringToDatetime = z.codec(
		z.iso.datetime(), // input schema: full ISO datetime string
		z.date(), // output schema: Date object
		{
			decode: (isoString) => new Date(isoString), // ISO string → Date
			encode: (date) => date.toISOString() // Date → Full ISO string
		}
	);

	const schema = z.object({
		createdAt: stringToDate.default(() => new Date("2023-01-01T00:00:00Z")),
		updatedAt: stringToDatetime.default(() => new Date("2023-12-31T23:59:59Z")),
		filter: z.string().default("")
	});

	const paramsObj = useSearchParams(schema);

	function setCreatedAt() {
		paramsObj.createdAt = new Date("2024-06-15T10:30:00Z");
	}

	function setUpdatedAt() {
		paramsObj.updatedAt = new Date("2024-06-20T18:00:00Z");
	}

	function resetParams() {
		paramsObj.reset();
	}

	// Create derived values for display
	let createdAtString = $.derived(() => paramsObj.createdAt instanceof Date ? paramsObj.createdAt.toISOString() : "Invalid Date");

	let updatedAtString = $.derived(() => paramsObj.updatedAt instanceof Date ? paramsObj.updatedAt.toISOString() : "Invalid Date");
	var div = root();
	var div_1 = $.sibling($.child(div), 2);
	var input = $.child(div_1);

	$.remove_input_defaults(input);

	var button = $.sibling(input, 2);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var div_3 = $.child(div_2);
	var span = $.sibling($.child(div_3), 2);
	var text = $.only_child(span, true);

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var span_1 = $.sibling($.child(div_4), 2);
	var text_1 = $.only_child(span_1, true);

	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var span_2 = $.sibling($.child(div_5), 2);
	var text_2 = $.only_child(span_2, true);

	$.reset(div_5);
	$.reset(div_2);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, paramsObj.filter);
		$.set_text(text_1, $.get(createdAtString));
		$.set_text(text_2, $.get(updatedAtString));
	});

	$.bind_value(input, () => paramsObj.filter, ($$value) => paramsObj.filter = $$value);
	$.delegated('click', button, setCreatedAt);
	$.delegated('click', button_1, setUpdatedAt);
	$.delegated('click', button_2, resetParams);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);
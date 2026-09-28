import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from "$app/state";
import { createSearchParamsSchema, useSearchParams } from "$lib/utilities/use-search-params/use-search-params.svelte";

var root = $.from_html(`<input data-testid="filter-input"/> <button data-testid="inc">Inc</button> <button data-testid="reset">Reset</button> <button data-testid="setBoth">Set both</button> <button data-testid="setCreatedAt">Set createdAt</button> <button data-testid="setUpdatedAt">Set updatedAt</button> <span data-testid="page"> </span> <span data-testid="filter"> </span> <span data-testid="createdAt"> </span> <span data-testid="updatedAt"> </span>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const mode = page.params.mode;

	const schema = createSearchParamsSchema({
		page: { type: "number", default: 1 },
		filter: { type: "string", default: "" },
		createdAt: {
			type: "date",
			default: new Date("2023-01-01T00:00:00Z"),
			dateFormat: "date"
		},
		updatedAt: { type: "date", default: new Date("2023-12-31T23:59:59Z") }
	});

	const options = {
		...mode === "default" && {},
		...mode === "show-default" && { showDefaults: true },
		...mode === "nopush" && { pushHistory: false },
		...mode === "debounce" && { debounce: 200 },
		...mode === "compress" && { compress: true },
		...mode === "memory" && { updateURL: false },
		...mode === "no-scroll" && { noScroll: true },
		...mode === "date-format-options" && { dateFormats: { createdAt: "date", updatedAt: "datetime" } }
	};

	const paramsObj = useSearchParams(schema, options);

	function inc() {
		paramsObj.page += 1;
	}

	function resetParams() {
		paramsObj.reset();
	}

	function setBoth() {
		paramsObj.update({ page: 5, filter: "bar" });
	}

	function setCreatedAt() {
		paramsObj.createdAt = new Date("2023-06-15T10:30:00Z");
	}

	function setUpdatedAt() {
		paramsObj.updatedAt = new Date("2023-06-20T18:00:00Z");
	}

	// Create a derived value to avoid potential infinite loops
	let createdAtString = $.derived(() => paramsObj.createdAt instanceof Date ? paramsObj.createdAt.toISOString() : "Invalid Date");

	let updatedAtString = $.derived(() => paramsObj.updatedAt instanceof Date ? paramsObj.updatedAt.toISOString() : "Invalid Date");
	var fragment = root();
	var input = $.first_child(fragment);

	$.remove_input_defaults(input);

	var button = $.sibling(input, 2);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var button_3 = $.sibling(button_2, 2);
	var button_4 = $.sibling(button_3, 2);
	var span = $.sibling(button_4, 2);
	var text = $.only_child(span, true);
	var span_1 = $.sibling(span, 2);
	var text_1 = $.only_child(span_1, true);
	var span_2 = $.sibling(span_1, 2);
	var text_2 = $.only_child(span_2, true);
	var span_3 = $.sibling(span_2, 2);
	var text_3 = $.only_child(span_3, true);

	$.template_effect(() => {
		$.set_text(text, paramsObj.page);
		$.set_text(text_1, paramsObj.filter);
		$.set_text(text_2, $.get(createdAtString));
		$.set_text(text_3, $.get(updatedAtString));
	});

	$.bind_value(input, () => paramsObj.filter, ($$value) => paramsObj.filter = $$value);
	$.delegated('click', button, inc);
	$.delegated('click', button_1, resetParams);
	$.delegated('click', button_2, setBoth);
	$.delegated('click', button_3, setCreatedAt);
	$.delegated('click', button_4, setUpdatedAt);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);
import * as $ from 'svelte/internal/server';
import { page } from "$app/state";
import { createSearchParamsSchema, useSearchParams } from "$lib/utilities/use-search-params/use-search-params.svelte";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		$$renderer.push(`<input data-testid="filter-input"${$.attr('value', paramsObj.filter)}/> <button data-testid="inc">Inc</button> <button data-testid="reset">Reset</button> <button data-testid="setBoth">Set both</button> <button data-testid="setCreatedAt">Set createdAt</button> <button data-testid="setUpdatedAt">Set updatedAt</button> <span data-testid="page">${$.escape(paramsObj.page)}</span> <span data-testid="filter">${$.escape(paramsObj.filter)}</span> <span data-testid="createdAt">${$.escape(createdAtString())}</span> <span data-testid="updatedAt">${$.escape(updatedAtString())}</span>`);
	});
}
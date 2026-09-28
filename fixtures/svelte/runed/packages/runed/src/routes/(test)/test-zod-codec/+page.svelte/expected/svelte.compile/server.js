import * as $ from 'svelte/internal/server';
import { useSearchParams } from "$lib/utilities/use-search-params/use-search-params.svelte";
import { z } from "zod";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		$$renderer.push(`<div><h1>Zod Codec Test Page</h1> <div class="controls svelte-nopl95"><input data-testid="filter-input"${$.attr('value', paramsObj.filter)} placeholder="Filter..."/> <button data-testid="setCreatedAt">Set createdAt</button> <button data-testid="setUpdatedAt">Set updatedAt</button> <button data-testid="reset">Reset</button></div> <div class="output svelte-nopl95"><div><strong>Filter:</strong> <span data-testid="filter">${$.escape(paramsObj.filter)}</span></div> <div><strong>CreatedAt (date-only format):</strong> <span data-testid="createdAt">${$.escape(createdAtString())}</span></div> <div><strong>UpdatedAt (datetime format):</strong> <span data-testid="updatedAt">${$.escape(updatedAtString())}</span></div></div></div>`);
	});
}
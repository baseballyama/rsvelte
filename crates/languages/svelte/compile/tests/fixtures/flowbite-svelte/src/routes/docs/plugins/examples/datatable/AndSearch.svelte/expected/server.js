import * as $ from 'svelte/internal/server';
import { Table } from "@flowbite-svelte-plugins/datatable";
import andsearch from "./data/andsearch.json";

export default function AndSearch($$renderer) {
	// Define the types for the template function parameters
	const andsearchOptions = {
		perPageSelect: [5, 10, 15, ["All", -1]],
		columns: [
			{
				select: 1,
				searchItemSeparator: ";",
				ignorePunctuation: false
			},
			{ select: 2, sortSequence: ["desc", "asc"] },
			{ select: 3, sortSequence: ["desc"] },
			{ select: 4, cellClass: "green", headerClass: "red" }
		],

		template: (options, dom) => `<div class='${options.classes.top}'>
        <div class='${options.classes.dropdown}'>
            <label>
                <select class='${options.classes.selector}'></select> ${options.labels.perPage}
            </label>
        </div>
        <div class='${options.classes.search}'>
            <input class='${options.classes.input}' placeholder='OR search' type='search' title='${options.labels.searchTitle}'${dom.id ? ` aria-controls="${dom.id}"` : ""}>
            <input class='${options.classes.input}' placeholder='AND search' type='search' data-and="true" title='${options.labels.searchTitle}'${dom.id ? ` aria-controls="${dom.id}"` : ""}>
        </div>
        </div>
        <div class='${options.classes.container}'${options.scrollY.length
			? ` style='height: ${options.scrollY}; overflow-Y: auto;'`
			: ""}></div>
        <div class='${options.classes.bottom}'>
        <div class='${options.classes.info}'></div>
        <nav class='${options.classes.pagination}'></nav>
    </div>`
	};

	Table($$renderer, { items: andsearch, dataTableOptions: andsearchOptions });
}
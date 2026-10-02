import * as $ from 'svelte/internal/server';
import { Text, Field, CheckboxGroup, Button } from "@svar-ui/svelte-core";
import { getData } from "../data";
import { Grid } from "../../src";

export default function SearchRows($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { allData: data, countries } = getData();

		const columns = [
			{ id: "id", header: "Id", width: 50 },
			{ id: "firstName", header: "First Name", width: 150 },
			{ id: "lastName", header: "Last Name", width: 150 },
			{ id: "email", header: "Email" },
			{ id: "country", header: "Country", options: countries },
			{ id: "companyName", header: "Company" }
		];

		const options = columns.map((col) => ({ id: col.id, label: col.header }));
		let api = void 0;
		let searchValue = "";
		let searchColumns = [];
		let search = void 0;
		let flatData = void 0;
		let currentSearchIndex = -1;
		let currentRowId = null;
		let searchRows = $.derived(() => Object.keys($.store_get($$store_subs ??= {}, '$search', search).rows));

		function searchByText({ value }) {
			searchValue = value;
			doSearch();
		}

		function searchByColumns({ value }) {
			searchColumns = value;
			doSearch();
		}

		function doSearch() {
			const searchParams = { search: searchValue };

			if (searchColumns.length) {
				const columns = {};

				searchColumns.forEach((col) => columns[col] = true);
				searchParams.columns = columns;
			}

			api.exec("search-rows", searchParams);
			currentSearchIndex = -1;
			sortedRows = currentRowId = null;
		}

		function init(obj) {
			api = obj;

			const rState = api.getReactiveState();

			search = rState.search;
			flatData = rState.flatData;
		}

		function showPrev() {
			currentSearchIndex -= 1;
			navigateToRow();
		}

		function showNext() {
			currentSearchIndex += 1;
			navigateToRow();
		}

		let sortedRows = null;

		function navigateToRow() {
			if (!sortedRows) sortedRows = $.store_get($$store_subs ??= {}, '$flatData', flatData).filter((r) => searchRows().includes(r.id + "")).map((r) => r.id);

			currentRowId = sortedRows[currentSearchIndex];

			// scroll to the current search result row
			api.exec("scroll", { row: currentRowId });
		}

		$$renderer.push(`<div class="demo svelte-13iihmv" style="padding: 20px;"><h4>Search Rows in DataGrid</h4> <div style="margin-bottom: 20px;"><div class="search svelte-13iihmv"><div style="width: 400px">`);

		Text($$renderer, {
			value: searchValue,
			placeholder: 'Enter search value...',
			icon: 'wxi-search',
			clear: true,
			onchange: searchByText
		});

		$$renderer.push(`<!----></div> `);

		if ($.store_get($$store_subs ??= {}, '$search', search)?.value?.trim()) {
			$$renderer.push(`<!--[0--><div class="navigation svelte-13iihmv">`);

			Button($$renderer, {
				text: 'Previous',
				onclick: showPrev,
				disabled: currentSearchIndex === -1
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				text: 'Next',
				onclick: showNext,
				disabled: currentSearchIndex === searchRows().length - 1
			});

			$$renderer.push(`<!----> <span>${$.escape(currentSearchIndex + 1)}/${$.escape(searchRows().length)} (rows matches)</span></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> `);

		Field($$renderer, {
			label: 'Columns:',
			position: 'left',
			type: 'checkbox',
			children: ($$renderer) => {
				CheckboxGroup($$renderer, {
					options,
					value: searchColumns,
					type: 'inline',
					onchange: searchByColumns
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div style="height: 400px;">`);

		Grid($$renderer, {
			data,
			columns,
			init,
			rowStyle: (row) => currentRowId == row.id ? "search-highlight" : ""
		});

		$$renderer.push(`<!----></div></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}
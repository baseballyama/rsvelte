import * as $ from 'svelte/internal/server';
import { Table } from "@flowbite-svelte-plugins/datatable";
import items from "./data/sample.json";
import { Spinner } from "flowbite-svelte";

export default function Callback($$renderer) {
	let isTableLoading = true;
	let tableInstance = null;

	function handleInitStart() {
		console.log("Table initialization started");
		isTableLoading = true;
	}

	function handleInitComplete(dataTable) {
		console.log("Table ready:", dataTable);
		isTableLoading = false;
	}

	function handleInitError(error) {
		console.error("Table initialization failed:", error);
		isTableLoading = false;
	}

	function handleSort(column, direction) {
		console.log(`Column ${column} sorted ${direction}`);
	}

	function handleSearch(query, matched) {
		console.log(`Search: "${query}" found ${matched.length} results`);
	}

	function handleRowSelect(rowIndex) {
		console.log(`Row ${rowIndex} selected`);
	}

	const selectRowsOptions = {
		rowRender: (row, tr, _index) => {
			if (!tr.attributes) {
				tr.attributes = {};
			}

			if (!tr.attributes.class) {
				tr.attributes.class = "";
			}

			if (row.selected) {
				tr.attributes.class += " selected";
			} else {
				tr.attributes.class = tr.attributes.class.replace(" selected", "");
			}

			return tr;
		}
	};

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		if (isTableLoading) {
			$$renderer.push('<!--[0-->');
			Spinner($$renderer, {});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		Table($$renderer, {
			items,
			onInitStart: handleInitStart,
			onInitComplete: handleInitComplete,
			onInitError: handleInitError,
			onSort: handleSort,
			onSearch: handleSearch,
			onSelectRow: handleRowSelect,
			selectable: true,
			dataTableOptions: selectRowsOptions,
			get isLoading() {
				return isTableLoading;
			},

			set isLoading($$value) {
				isTableLoading = $$value;
				$$settled = false;
			},

			get dataTableInstance() {
				return tableInstance;
			},

			set dataTableInstance($$value) {
				tableInstance = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}
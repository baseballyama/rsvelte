import * as $ from 'svelte/internal/server';
import { Table } from "@flowbite-svelte-plugins/datatable";
import items from "./data/sample.json";

export default function SelectingRows($$renderer) {
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

	Table($$renderer, { selectable: true, items, dataTableOptions: selectRowsOptions });
}
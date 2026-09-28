import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Table } from "@flowbite-svelte-plugins/datatable";
import items from "./data/sample.json";

export default function SelectingRows($$anchor) {
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

	Table($$anchor, {
		selectable: true,
		get items() {
			return items;
		},

		get dataTableOptions() {
			return selectRowsOptions;
		}
	});
}
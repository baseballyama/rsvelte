import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Grid } from "@svar-ui/svelte-grid";
import { getData } from "./data/index";
import CheckboxCell from "./components/CheckboxCell.svelte";
import StatusCell from "./components/StatusCell.svelte";
import AssignCell from "./components/AssignCell.svelte";
import TagsCell from "./components/TagsCell.svelte";
import StatusStub from "./components/StatusStub.svelte";

var root = $.from_html(`<div class="demo"><!></div>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const { data, statuses } = getData();

	function columnStyle(col) {
		if (col.id == "id") return "checkbox-cell";
		if (col.id == "taskName") return "task-cell";

		return "";
	}

	const columns = [
		{ id: "id", cell: CheckboxCell, width: 52 },
		{
			id: "taskName",
			header: "Task name",
			// width: 309,
			flexgrow: 1,
			treetoggle: true,
			sort: true
		},

		{
			id: "status",
			resize: true,
			header: "Status",
			cell: StatusCell,
			width: 133,
			editor: { type: "richselect", config: { cell: StatusStub } },
			options: statuses
		},
		{ id: "assign", header: "Assign", cell: AssignCell, width: 219 },
		{
			id: "due",
			header: "Due",
			width: 204,
			template: (v) => v
				? v.toLocaleString("en-US", { year: "numeric", month: "long", day: "numeric" })
				: "",
			editor: "datepicker"
		},
		{ id: "tags", header: "Tags", cell: TagsCell, width: 211 }
	];

	var div = root();
	var node = $.child(div);

	Grid(node, {
		sizes: { rowHeight: 73 },
		get data() {
			return data;
		},

		get columns() {
			return columns;
		},
		select: false,
		tree: true,
		columnStyle
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}
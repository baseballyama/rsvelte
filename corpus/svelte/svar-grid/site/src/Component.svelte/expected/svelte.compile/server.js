import * as $ from 'svelte/internal/server';
import { Grid } from "wx-svelte-grid";
import { getData } from "./customTable/data";
import CheckboxCell from "./customTable/CheckboxCell.svelte";
import StatusCell from "./customTable/StatusCell.svelte";
import AssignCell from "./customTable/AssignCell.svelte";
import TagsCell from "./customTable/TagsCell.svelte";
import StatusStub from "./customTable/StatusStub.svelte";

export default function Component($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { data, statuses } = getData();

		const columns = [
			{ id: "id", cell: CheckboxCell, width: 34 },
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

		Grid($$renderer, {
			sizes: { rowHeight: 73 },
			data,
			columns,
			select: false,
			tree: true
		});
	});
}
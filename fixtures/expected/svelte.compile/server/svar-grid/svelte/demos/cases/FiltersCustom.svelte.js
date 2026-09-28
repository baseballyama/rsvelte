import * as $ from 'svelte/internal/server';
import { getData } from "../data";
import { Grid } from "../../src";
import StatusCell from "../custom/StatusCell.svelte";
import AvatarCell from "../custom/AvatarCell.svelte";

export default function FiltersCustom($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { allData, countries, users } = getData();

		const columns = [
			{ id: "id", width: 50 },
			{
				id: "firstName",
				header: [
					"First Name",
					{
						filter: { type: "text", config: { icon: "wxi-search", clear: true } }
					}
				],
				footer: "First Name"
			},

			{
				id: "lastName",
				header: [
					"Last Name",
					{
						filter: { type: "text", config: { icon: "wxi-search", clear: true } }
					}
				],
				footer: "Last Name"
			},

			{
				id: "country",
				header: [
					"Country",
					{
						filter: {
							type: "richselect",
							config: {
								options: countries,
								template: (opt) => `${opt.id}. ${opt.label}`
							}
						}
					}
				],
				options: countries
			},

			{
				id: "checked",
				header: [
					"Active",
					{
						filter: {
							type: "richselect",
							config: {
								template: (opt) => `● ${opt.label}`,
								options: [{ id: 1, label: "active" }, { id: 2, label: "non-active" }],
								handler: (value, filter) => {
									if (!filter) return true;

									return value === filter || !value && filter == 2;
								}
							}
						}
					}
				],
				cell: StatusCell
			},

			{
				id: "assigned",
				header: [
					"Assigned",
					{
						filter: { type: "multiselect", config: { cell: AvatarCell } }
					}
				],
				options: users.map((user) => ({ ...user, name: user.label })),
				cell: AvatarCell
			}
		];

		$$renderer.push(`<div class="demo svelte-1vma4tt" style="padding: 20px;"><h4>Grid with custom filtering in header</h4> <div style="height: 400px;">`);

		Grid($$renderer, {
			data: allData,
			columns,
			cellStyle: (_row, column) => column.id === "assigned" ? "vcenter" : ""
		});

		$$renderer.push(`<!----></div></div>`);
	});
}
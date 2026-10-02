import * as $ from 'svelte/internal/server';
import { RichSelect } from "@svar-ui/svelte-core";
import { Editor, registerEditorItem } from "@svar-ui/svelte-editor";
import { Comments } from "@svar-ui/svelte-comments";
import { Grid, getEditorConfig } from "../../src";
import { getData } from "../data";

export default function ExternalEditorComments($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { allData: data, countries, users } = getData();

		data.forEach((d, i) => {
			d.comments = !i
				? [
					{
						id: 1,
						user: 1,
						content: "Greetings, fellow colleagues. I would like to share my insights on this task. I reckon we should deal with at least half of the points in the plan without further delays.",
						date: new Date()
					},

					{
						id: 2,
						user: 2,
						content: "Hi, Diego. I am sure that that's exactly what is thought best out there in Dunwall. Let's just do what we are supposed to do to get the result.",
						date: new Date()
					},

					{
						id: 5,
						user: 3,
						content: "Absolutely, Diego. Action speaks louder than words, and in this case, it's about executing the plan efficiently. Let's prioritize tasks and tackle them head-on.",
						date: new Date()
					}
				]
				: [];
		});

		const columns = [
			{ id: "id", width: 50 },
			{
				id: "firstName",
				header: "Name",
				editor: {
					type: "text",
					label: "First name",
					config: { placeholder: "Enter first name" }
				},
				width: 160
			},

			{
				id: "country",
				header: "Country",
				editor: "combo",
				options: countries,
				width: 160
			},
			{ id: "email", header: "Email", width: 160 },
			{
				id: "date",
				header: "Date",
				width: 160,
				template: (v) => v ? v.toLocaleDateString() : ""
			},
			{ id: "companyName", header: "Company" },
			{
				id: "comments",
				header: "Comments",
				template: (v) => `${v.length} ✉ `,
				width: 90,
				editor: {
					type: "comments",
					label: "Comments",
					users: users.map((user) => ({ ...user, name: user.label })),
					activeUser: 1
				}
			}
		];

		// Here are sections
		registerEditorItem("combo", RichSelect);

		registerEditorItem("comments", Comments);

		// Editor config
		const items = getEditorConfig(columns);

		let dataToEdit = null;
		let api = void 0;

		const init = (api) => {
			api.intercept("open-editor", ({ id }) => {
				dataToEdit = api.getRow(id);

				return false;
			});

			api.on("select-row", ({ id }) => {
				if (dataToEdit) {
					dataToEdit = id ? api.getRow(id) : null;
				}
			});
		};

		$$renderer.push(`<div style="padding: 20px;"><h4>Grid - dbl-click to show external editor with comments</h4> <div style="height: 400px;">`);

		Grid($$renderer, {
			data,
			columns,
			init,
			columnStyle: (col) => col.id === "comments" ? "center" : ""
		});

		$$renderer.push(`<!----></div> `);

		if (dataToEdit) {
			$$renderer.push('<!--[0-->');

			Editor($$renderer, {
				values: dataToEdit,
				items,
				placement: 'sidebar',
				autoSave: true,
				onchange: ({ key, value }) => {
					api.exec("update-cell", { id: dataToEdit.id, column: key, value });
				},

				onaction: ({ item }) => {
					if (item.comp) dataToEdit = null;
				}
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}
import * as $ from 'svelte/internal/server';
import { Button } from "@svar-ui/svelte-core";
import { getData } from "../data";
import { Grid, HeaderMenu, ContextMenu } from "../../src";

export default function UndoRedo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { data } = getData();
		let api = void 0;
		let history = $.derived(() => api?.getReactiveState().history);

		const columns = [
			{ id: "id", width: 50 },
			{
				id: "firstName",
				header: "First Name",
				footer: "First Name",
				editor: "text",
				width: 150
			},

			{
				id: "lastName",
				header: "Last Name",
				footer: "Last Name",
				editor: "text",
				width: 150
			},

			{
				id: "email",
				header: { text: "Email", collapsible: true },
				footer: "Email"
			},

			{
				id: "companyName",
				header: { text: "Company", collapsible: true },
				footer: "Company"
			},
			{ id: "city", header: "City" },
			{ id: "stars", header: "Stars" }
		];

		columns.forEach((c) => c.resize = true);

		function handleUndo(api) {
			api.exec("undo");
		}

		function handleRedo(api) {
			api.exec("redo");
		}

		$$renderer.push(`<div style="padding: 20px;"><div class="buttons svelte-1gxrzrn" style="margin: 20px 0;">`);

		Button($$renderer, {
			type: 'primary',
			onclick: () => handleUndo(api),
			disabled: history() && !$.store_get($$store_subs ??= {}, '$history', history()).undo,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Undo`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			type: 'primary',
			onclick: () => handleRedo(api),
			disabled: history() && !$.store_get($$store_subs ??= {}, '$history', history()).redo,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Redo`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div>`);

		ContextMenu($$renderer, {
			api,
			children: ($$renderer) => {
				HeaderMenu($$renderer, {
					api,
					children: ($$renderer) => {
						Grid($$renderer, { data, columns, undo: true, reorder: true });
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}
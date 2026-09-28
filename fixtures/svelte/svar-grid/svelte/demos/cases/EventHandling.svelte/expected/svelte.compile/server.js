import * as $ from 'svelte/internal/server';
import { Field, Switch, Button } from "@svar-ui/svelte-core";
import { EventResolver } from "@svar-ui/lib-state";
import { RestDataProvider } from "@svar-ui/grid-data-provider";
import { getContext } from "svelte";
import { getBackend } from "../data";
import { Grid } from "../../src";

export default function EventHandling($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { columns } = getBackend();
		const helpers = getContext("wx-helpers");
		let blockSelect = false;
		let kapi;
		let data = [];
		const provider = new RestDataProvider("https://grid-backend.svar.dev/films", (o) => o);

		provider.getData().then((v) => data = v);

		async function addRow() {
			const ev = await kapi.exec("add-row", {
				row: {},
				done: (ev) => {
					helpers.showNotice({ text: "row added, id:" + ev.row.id });
				}
			});

			helpers.showNotice({ text: "[add] finish, server:" + ev.response.id });
		}

		async function deleteRow() {
			await kapi.exec("delete-row", {
				id: kapi.getState().selectedRows[0],
				done: () => {
					helpers.showNotice({ text: "[delete] store" });
				}
			});

			helpers.showNotice({ text: "[delete] finish" });
		}

		function init(api) {
			// add a catch for the event fulfillment
			api.setNext(new EventResolver("done")).setNext(provider);

			//selection handlers
			api.on("select-row", log("[select] on"));

			api.intercept("select-row", () => {
				if (blockSelect) return false; else log("[select] intercept")();
			});

			api.on("add-row", log("[add] on"));
			api.intercept("add-row", log("[add] intercept"));
			api.on("delete-row", log("[delete] on"));
			api.intercept("delete-row", log("[delete] intercept"));
			kapi = api;
		}

		function log(text) {
			return () => helpers.showNotice({ text });
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div style="padding: 20px;"><div>`);

			Field($$renderer, {
				label: 'Prevent selection after adding',
				children: ($$renderer) => {
					Switch($$renderer, {
						get value() {
							return blockSelect;
						},

						set value($$value) {
							blockSelect = $$value;
							$$settled = false;
						}
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				onclick: addRow,
				type: 'primary',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Add row`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				onclick: deleteRow,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Delete row`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <hr/> `);

			Grid($$renderer, {
				init,
				data,
				columns,
				onselectrow: log("[select] handler"),
				onaddrow: log("[add] handler"),
				ondeleterow: log("[delete] handler")
			});

			$$renderer.push(`<!----></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}
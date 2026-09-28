import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Field, Switch, Button } from "@svar-ui/svelte-core";
import { EventResolver } from "@svar-ui/lib-state";
import { RestDataProvider } from "@svar-ui/grid-data-provider";
import { getContext } from "svelte";
import { getBackend } from "../data";
import { Grid } from "../../src";

var root = $.from_html(`<div style="padding: 20px;"><div><!> <!> <!> <hr/> <!></div></div>`);

export default function EventHandling($$anchor, $$props) {
	$.push($$props, true);

	const { columns } = getBackend();
	const helpers = getContext("wx-helpers");
	let blockSelect = $.state(false);
	let kapi;
	let data = $.state($.proxy([]));
	const provider = new RestDataProvider("https://grid-backend.svar.dev/films", (o) => o);

	provider.getData().then((v) => $.set(data, v, true));

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
			if ($.get(blockSelect)) return false; else log("[select] intercept")();
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

	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Field(node, {
		label: 'Prevent selection after adding',
		children: ($$anchor, $$slotProps) => {
			Switch($$anchor, {
				get value() {
					return $.get(blockSelect);
				},

				set value($$value) {
					$.set(blockSelect, $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		onclick: addRow,
		type: 'primary',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Add row');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		onclick: deleteRow,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Delete row');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 4);

	{
		let $0 = $.derived(() => log("[select] handler"));
		let $1 = $.derived(() => log("[add] handler"));
		let $2 = $.derived(() => log("[delete] handler"));

		Grid(node_3, {
			init,
			get data() {
				return $.get(data);
			},

			get columns() {
				return columns;
			},

			get onselectrow() {
				return $.get($0);
			},

			get onaddrow() {
				return $.get($1);
			},

			get ondeleterow() {
				return $.get($2);
			}
		});
	}

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}
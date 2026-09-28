import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "@svar-ui/svelte-core";
import { getData } from "../data";
import { Grid, HeaderMenu, ContextMenu } from "../../src";

var root = $.from_html(`<div style="padding: 20px;"><div class="buttons svelte-1gxrzrn" style="margin: 20px 0;"><!> <!></div> <div><!></div></div>`);

export default function UndoRedo($$anchor, $$props) {
	$.push($$props, true);

	const $history = () => $.store_get($.get(history), '$history', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { data } = getData();
	let api = $.state(void 0);
	let history = $.derived(() => $.get(api)?.getReactiveState().history);

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

	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	{
		let $0 = $.derived(() => $.get(history) && !$history().undo);

		Button(node, {
			type: 'primary',
			onclick: () => handleUndo($.get(api)),
			get disabled() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				$.next();

				var text = $.text('Undo');

				$.append($$anchor, text);
			},
			$$slots: { default: true }
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => $.get(history) && !$history().redo);

		Button(node_1, {
			type: 'primary',
			onclick: () => handleRedo($.get(api)),
			get disabled() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_1 = $.text('Redo');

				$.append($$anchor, text_1);
			},
			$$slots: { default: true }
		});
	}

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_2 = $.child(div_2);

	ContextMenu(node_2, {
		get api() {
			return $.get(api);
		},

		children: ($$anchor, $$slotProps) => {
			HeaderMenu($$anchor, {
				get api() {
					return $.get(api);
				},

				children: ($$anchor, $$slotProps) => {
					$.bind_this(
						Grid($$anchor, {
							get data() {
								return data;
							},

							get columns() {
								return columns;
							},
							undo: true,
							reorder: true
						}),
						($$value) => $.set(api, $$value, true),
						() => $.get(api)
					);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_2);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "@svar-ui/svelte-core";
import { RestDataProvider } from "@svar-ui/grid-data-provider";
import { Grid } from "../../src/";

var root = $.from_html(`<div style="padding: 20px; height: 600px;"><div style="padding-bottom: 10px;"><!> <!></div> <!></div>`);

export default function RestBackend($$anchor, $$props) {
	$.push($$props, true);

	const columns = [
		{
			id: "name",
			header: "Title",
			flexgrow: 1,
			sort: true,
			editor: "text"
		},

		{
			id: "year",
			header: "Year",
			width: 100,
			sort: true,
			editor: "text"
		},

		{
			id: "votes",
			header: "Votes",
			width: 100,
			sort: true,
			editor: "text"
		}
	];

	let data = $.state($.proxy([]));

	const provider = new RestDataProvider("https://grid-backend.svar.dev/films", (obj) => {
		obj.year = obj.year * 1;
		obj.votes = obj.votes * 1;
	});

	provider.getData().then((v) => $.set(data, v, true));

	let api = $.state(void 0);

	const deleteRow = () => {
		const id = $.get(api).getState().selectedRows[0];

		if (id) {
			$.get(api).exec("delete-row", { id });
		}
	};

	const addRow = () => {
		$.get(api).exec("add-row", { row: { name: "New Film", year: "2022", votes: 1 } });
	};

	const init = (api) => {
		api.setNext(provider);
	};

	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Button(node, {
		onclick: addRow,
		type: 'primary',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Add row');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		onclick: deleteRow,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Delete row');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var node_2 = $.sibling(div_1, 2);

	$.bind_this(
		Grid(node_2, {
			get data() {
				return $.get(data);
			},

			get columns() {
				return columns;
			},
			init
		}),
		($$value) => $.set(api, $$value, true),
		() => $.get(api)
	);

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}
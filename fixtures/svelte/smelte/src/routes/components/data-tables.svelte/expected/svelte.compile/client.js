import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DataTable from "components/DataTable";
import Image from "components/Image";
import Code from "docs/Code.svelte";
import table from "examples/table.txt";

var root = $.from_html(`<div class="overflow-auto p-1"><!> <!></div>`);

export default function Data_tables($$anchor) {
	let data = [];
	let loading = true;

	async function getData() {
		if (typeof window === "undefined") return;

		loading = true;

		const res = await fetch("data.json");
		const body = await res.json();

		data = body._embedded.episodes;
		setTimeout(() => loading = false, 500);
	}

	getData();

	var div = root();
	var node = $.child(div);

	{
		let $0 = $.derived(() => [
			{ label: "ID", field: "id", class: "md:w-10" },
			{
				label: "Ep.",
				value: (v) => `S${v.season}E${v.number}`,
				class: "md:w-10",
				editable: false
			},
			{ field: "name", class: "md:w-10" },
			{
				field: "summary",
				textarea: true,
				value: (v) => v && v.summary ? v.summary : "",
				add: "text-sm text-gray-700 caption md:w-full sm:w-64",
				remove: "text-right",
				headerRemove: "justify-end",
				iconAfter: true
			},

			{
				field: "thumbnail",
				component: Image,
				componentProps: (v) => v && v.image
					? {
						src: v.image.medium.replace("http", "https"),
						class: 'h-full',
						height: 100,
						alt: v.name
					}
					: {},
				class: "w-48",
				sortable: false,
				editable: false,
				headerRemove: "justify-end"
			}
		]);

		DataTable(node, {
			get data() {
				return data;
			},

			get loading() {
				return loading;
			},

			get columns() {
				return $.get($0);
			},

			$$events: {
				update: ({ detail }) => {
					const { column, item, value } = detail;
					const index = data.findIndex((i) => i.id === item.id);

					data[index][column.field] = value;
				}
			}
		});
	}

	var node_1 = $.sibling(node, 2);

	Code(node_1, {
		get code() {
			return table;
		}
	});

	$.reset(div);
	$.append($$anchor, div);
}
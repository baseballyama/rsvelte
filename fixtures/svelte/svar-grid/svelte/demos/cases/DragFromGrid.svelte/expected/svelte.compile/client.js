import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Grid } from "../../src/";
import { getData } from "../data";
import { locateID } from "@svar-ui/lib-dom";

var root = $.from_html(`<p class="empty svelte-4e3hfn">Drag a row from the grid and drop it here.</p>`);
var root_1 = $.from_html(`<div class="card svelte-4e3hfn"><div class="card-name svelte-4e3hfn"> </div> <div class="card-meta svelte-4e3hfn"><span> </span> <span> </span></div> <div class="card-email svelte-4e3hfn"> </div></div>`);
var root_2 = $.from_html(`<div class="demo svelte-4e3hfn"><div class="grid-box svelte-4e3hfn"><!></div> <div><h4 class="svelte-4e3hfn">Dropped here</h4> <!></div></div>`);

export default function DragFromGrid($$anchor, $$props) {
	$.push($$props, true);

	const { allData, countries } = getData();

	const columns = [
		{ id: "id", width: 50, header: "ID" },
		{ id: "firstName", header: "First Name", width: 150 },
		{ id: "lastName", header: "Last Name", width: 150 },
		{
			id: "country",
			options: countries,
			header: "Country",
			width: 120
		},
		{ id: "email", header: "Email", flexgrow: 1 }
	];

	const data = allData.slice(0, 12);
	const countryById = Object.fromEntries(countries.map((c) => [c.id, c]));
	let api = $.state(void 0);
	let droppedCards = $.state($.proxy([]));
	let boxActive = $.state(false);

	function onGridDragStart(ev) {
		const id = locateID(ev, "data-id");

		if (id == null) return;

		const row = $.get(api).getRow(id);

		ev.dataTransfer.setData("application/json", JSON.stringify(row));
		ev.dataTransfer.effectAllowed = "copy";
	}

	function onBoxDragOver(ev) {
		ev.preventDefault();
		ev.dataTransfer.dropEffect = "copy";
		$.set(boxActive, true);
	}

	function onBoxDragLeave(ev) {
		if (!ev.currentTarget.contains(ev.relatedTarget)) $.set(boxActive, false);
	}

	function onBoxDrop(ev) {
		ev.preventDefault();
		$.set(boxActive, false);

		const raw = ev.dataTransfer.getData("application/json");

		if (!raw) return;

		// copy - source row stays in the grid
		$.set(droppedCards, [...$.get(droppedCards), JSON.parse(raw)], true);
	}

	var div = root_2();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	$.bind_this(
		Grid(node, {
			get data() {
				return data;
			},

			get columns() {
				return columns;
			},
			draggableRows: true
		}),
		($$value) => $.set(api, $$value, true),
		() => $.get(api)
	);

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	let classes;
	var node_1 = $.sibling($.child(div_2), 2);

	{
		var consequent = ($$anchor) => {
			var p = root();

			$.append($$anchor, p);
		};

		var alternate = ($$anchor) => {
			var fragment = $.comment();
			var node_2 = $.first_child(fragment);

			$.each(node_2, 17, () => $.get(droppedCards), $.index, ($$anchor, card) => {
				var div_3 = root_1();
				var div_4 = $.child(div_3);
				var text = $.only_child(div_4);
				var div_5 = $.sibling(div_4, 2);
				var span = $.child(div_5);
				var text_1 = $.only_child(span, true);
				var span_1 = $.sibling(span, 2);
				var text_2 = $.only_child(span_1, true);

				$.reset(div_5);

				var div_6 = $.sibling(div_5, 2);
				var text_3 = $.only_child(div_6, true);

				$.reset(div_3);

				$.template_effect(() => {
					$.set_text(text, `${$.get(card).firstName ?? ''}
						${$.get(card).lastName ?? ''}`);

					$.set_text(text_1, countryById[$.get(card).country]?.flag);
					$.set_text(text_2, countryById[$.get(card).country]?.label);
					$.set_text(text_3, $.get(card).email);
				});

				$.append($$anchor, div_3);
			});

			$.append($$anchor, fragment);
		};

		$.if(node_1, ($$render) => {
			if ($.get(droppedCards).length === 0) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div_2);
	$.reset(div);
	$.template_effect(() => classes = $.set_class(div_2, 1, 'drop-box svelte-4e3hfn', null, classes, { active: $.get(boxActive) }));
	$.event('dragstart', div_1, onGridDragStart);
	$.event('dragover', div_2, onBoxDragOver);
	$.event('dragleave', div_2, onBoxDragLeave);
	$.event('drop', div_2, onBoxDrop);
	$.append($$anchor, div);
	$.pop();
}
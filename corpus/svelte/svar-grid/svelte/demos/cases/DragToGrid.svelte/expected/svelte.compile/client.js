import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Grid } from "../../src/";
import { getData } from "../data";
import { locateID } from "@svar-ui/lib-dom";

var root = $.from_html(`<div class="card svelte-ogo8i8" draggable="true" role="listitem"><div class="card-name svelte-ogo8i8"> </div> <div class="card-meta svelte-ogo8i8"><span> </span> <span> </span></div> <div class="card-email svelte-ogo8i8"> </div></div>`);
var root_1 = $.from_html(`<div class="demo svelte-ogo8i8"><div class="cards svelte-ogo8i8"><h4 class="svelte-ogo8i8">Contacts</h4> <p class="hint svelte-ogo8i8">Drag a card onto the grid to add it as a row.</p> <!></div> <div class="grid-box svelte-ogo8i8"><!></div></div>`);

export default function DragToGrid($$anchor, $$props) {
	$.push($$props, true);

	const { countries } = getData();

	// columns shown in the grid (country renders its label via options)
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

	// start with a couple of rows so there is something to drop onto
	const data = [
		{
			id: 1,
			firstName: "Ernest",
			lastName: "Schuppe",
			country: 6,
			email: "Leora13@yahoo.com"
		},

		{
			id: 2,
			firstName: "Janis",
			lastName: "Vandervort",
			country: 4,
			email: "Mose_Gerhold51@yahoo.com"
		},

		{
			id: 3,
			firstName: "Makenzie",
			lastName: "Bode",
			country: 3,
			email: "Frieda.Sauer61@gmail.com"
		}
	];

	// cards available to drag into the grid (no id - assigned on add)
	const cards = [
		{
			firstName: "Aurelie",
			lastName: "Fadel",
			country: 5,
			email: "Aurelie.Fadel@gmail.com"
		},

		{
			firstName: "Marcus",
			lastName: "Konopelski",
			country: 1,
			email: "Marcus_K@yahoo.com"
		},

		{
			firstName: "Dorthy",
			lastName: "Hyatt",
			country: 3,
			email: "Dorthy.Hyatt@hotmail.com"
		},

		{
			firstName: "Lukas",
			lastName: "Brakus",
			country: 4,
			email: "Lukas.Brakus@gmail.com"
		}
	];

	const countryById = Object.fromEntries(countries.map((c) => [c.id, c]));
	let api = $.state(void 0);
	let dropTargetId = $.state(null);
	const rowStyle = (row) => row.id === $.get(dropTargetId) ? "wx-drop-target" : "";

	function onCardDragStart(ev, card) {
		ev.dataTransfer.setData("application/json", JSON.stringify(card));
		ev.dataTransfer.effectAllowed = "copy";
	}

	function onGridDragOver(ev) {
		// allow drop
		ev.preventDefault();

		ev.dataTransfer.dropEffect = "copy";
		$.set(dropTargetId, locateID(ev, "data-id"), true);
	}

	function onGridDragLeave(ev) {
		// only clear when the cursor actually leaves the wrapper
		if (!ev.currentTarget.contains(ev.relatedTarget)) $.set(dropTargetId, null);
	}

	function onGridDrop(ev) {
		ev.preventDefault();

		const raw = ev.dataTransfer.getData("application/json");

		if (!raw) return;

		const row = JSON.parse(raw);

		$.get(api).exec("add-row", $.get(dropTargetId) != null ? { row, after: $.get(dropTargetId) } : { row });
		$.set(dropTargetId, null);
	}

	var div = root_1();
	var div_1 = $.child(div);
	var node = $.sibling($.child(div_1), 4);

	$.each(node, 17, () => cards, (card) => card.email, ($$anchor, card) => {
		var div_2 = root();
		var div_3 = $.child(div_2);
		var text = $.only_child(div_3);
		var div_4 = $.sibling(div_3, 2);
		var span = $.child(div_4);
		var text_1 = $.only_child(span, true);
		var span_1 = $.sibling(span, 2);
		var text_2 = $.only_child(span_1, true);

		$.reset(div_4);

		var div_5 = $.sibling(div_4, 2);
		var text_3 = $.only_child(div_5, true);

		$.reset(div_2);

		$.template_effect(() => {
			$.set_text(text, `${$.get(card).firstName ?? ''}
					${$.get(card).lastName ?? ''}`);

			$.set_text(text_1, countryById[$.get(card).country]?.flag);
			$.set_text(text_2, countryById[$.get(card).country]?.label);
			$.set_text(text_3, $.get(card).email);
		});

		$.event('dragstart', div_2, (ev) => onCardDragStart(ev, $.get(card)));
		$.append($$anchor, div_2);
	});

	$.reset(div_1);

	var div_6 = $.sibling(div_1, 2);
	var node_1 = $.child(div_6);

	$.bind_this(
		Grid(node_1, {
			get data() {
				return data;
			},

			get columns() {
				return columns;
			},
			rowStyle
		}),
		($$value) => $.set(api, $$value, true),
		() => $.get(api)
	);

	$.reset(div_6);
	$.reset(div);
	$.event('dragover', div_6, onGridDragOver);
	$.event('dragleave', div_6, onGridDragLeave);
	$.event('drop', div_6, onGridDrop);
	$.append($$anchor, div);
	$.pop();
}
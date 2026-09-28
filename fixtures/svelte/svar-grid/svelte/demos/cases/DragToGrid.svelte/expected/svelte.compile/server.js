import * as $ from 'svelte/internal/server';
import { Grid } from "../../src/";
import { getData } from "../data";
import { locateID } from "@svar-ui/lib-dom";

export default function DragToGrid($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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
		let api = void 0;
		let dropTargetId = null;
		const rowStyle = (row) => row.id === dropTargetId ? "wx-drop-target" : "";

		function onCardDragStart(ev, card) {
			ev.dataTransfer.setData("application/json", JSON.stringify(card));
			ev.dataTransfer.effectAllowed = "copy";
		}

		function onGridDragOver(ev) {
			// allow drop
			ev.preventDefault();

			ev.dataTransfer.dropEffect = "copy";
			dropTargetId = locateID(ev, "data-id");
		}

		function onGridDragLeave(ev) {
			// only clear when the cursor actually leaves the wrapper
			if (!ev.currentTarget.contains(ev.relatedTarget)) dropTargetId = null;
		}

		function onGridDrop(ev) {
			ev.preventDefault();

			const raw = ev.dataTransfer.getData("application/json");

			if (!raw) return;

			const row = JSON.parse(raw);

			api.exec("add-row", dropTargetId != null ? { row, after: dropTargetId } : { row });
			dropTargetId = null;
		}

		$$renderer.push(`<div class="demo svelte-ogo8i8"><div class="cards svelte-ogo8i8"><h4 class="svelte-ogo8i8">Contacts</h4> <p class="hint svelte-ogo8i8">Drag a card onto the grid to add it as a row.</p> <!--[-->`);

		const each_array = $.ensure_array_like(cards);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let card = each_array[$$index];

			$$renderer.push(`<div class="card svelte-ogo8i8" draggable="true" role="listitem"><div class="card-name svelte-ogo8i8">${$.escape(card.firstName)}
					${$.escape(card.lastName)}</div> <div class="card-meta svelte-ogo8i8"><span>${$.escape(countryById[card.country]?.flag)}</span> <span>${$.escape(countryById[card.country]?.label)}</span></div> <div class="card-email svelte-ogo8i8">${$.escape(card.email)}</div></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="grid-box svelte-ogo8i8">`);
		Grid($$renderer, { data, columns, rowStyle });
		$$renderer.push(`<!----></div></div>`);
	});
}
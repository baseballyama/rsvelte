import * as $ from 'svelte/internal/server';
import { Grid } from "../../src/";
import { getData } from "../data";
import { locateID } from "@svar-ui/lib-dom";

export default function DragFromGrid($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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
		let api = void 0;
		let droppedCards = [];
		let boxActive = false;

		function onGridDragStart(ev) {
			const id = locateID(ev, "data-id");

			if (id == null) return;

			const row = api.getRow(id);

			ev.dataTransfer.setData("application/json", JSON.stringify(row));
			ev.dataTransfer.effectAllowed = "copy";
		}

		function onBoxDragOver(ev) {
			ev.preventDefault();
			ev.dataTransfer.dropEffect = "copy";
			boxActive = true;
		}

		function onBoxDragLeave(ev) {
			if (!ev.currentTarget.contains(ev.relatedTarget)) boxActive = false;
		}

		function onBoxDrop(ev) {
			ev.preventDefault();
			boxActive = false;

			const raw = ev.dataTransfer.getData("application/json");

			if (!raw) return;

			// copy - source row stays in the grid
			droppedCards = [...droppedCards, JSON.parse(raw)];
		}

		$$renderer.push(`<div class="demo svelte-4e3hfn"><div class="grid-box svelte-4e3hfn">`);
		Grid($$renderer, { data, columns, draggableRows: true });
		$$renderer.push(`<!----></div> <div${$.attr_class('drop-box svelte-4e3hfn', void 0, { 'active': boxActive })}><h4 class="svelte-4e3hfn">Dropped here</h4> `);

		if (droppedCards.length === 0) {
			$$renderer.push(`<!--[0--><p class="empty svelte-4e3hfn">Drag a row from the grid and drop it here.</p>`);
		} else {
			$$renderer.push(`<!--[-1--><!--[-->`);

			const each_array = $.ensure_array_like(droppedCards);

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let card = each_array[i];

				$$renderer.push(`<div class="card svelte-4e3hfn"><div class="card-name svelte-4e3hfn">${$.escape(card.firstName)}
						${$.escape(card.lastName)}</div> <div class="card-meta svelte-4e3hfn"><span>${$.escape(countryById[card.country]?.flag)}</span> <span>${$.escape(countryById[card.country]?.label)}</span></div> <div class="card-email svelte-4e3hfn">${$.escape(card.email)}</div></div>`);
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}
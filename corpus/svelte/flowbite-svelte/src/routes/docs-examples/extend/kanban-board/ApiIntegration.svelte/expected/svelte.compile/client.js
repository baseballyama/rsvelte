import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { KanbanBoard } from "flowbite-svelte";
import { onMount } from "svelte";

var root = $.from_html(`<div class="flex h-64 items-center justify-center"><div class="text-gray-600">Loading board...</div></div>`);
var root_1 = $.from_html(`<div class="rounded border border-red-200 bg-red-50 p-4 text-red-800"> </div>`);
var root_2 = $.from_html(`<div class="bg-white p-4 dark:bg-gray-800"><!></div>`);

export default function ApiIntegration($$anchor, $$props) {
	$.push($$props, true);

	let columns = $.state($.proxy([]));
	let loading = $.state(true);
	let error = $.state(null);

	onMount(async () => {
		try {
			const response = await fetch("/api/kanban/columns");

			if (!response.ok) throw new Error("Failed to load board");

			$.set(columns, await response.json(), true);
		} catch(e) {
			$.set(error, e instanceof Error ? e.message : "Unknown error", true);
		} finally {
			$.set(loading, false);
		}
	});

	async function handleMove(card, from, to) {
		try {
			const response = await fetch("/api/kanban/move", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ cardId: card.id, fromColumnId: from.id, toColumnId: to.id })
			});

			if (!response.ok) throw new Error("Failed to move card");
		} catch(e) {
			// Rollback on error
			alert("Failed to move card. Please try again.");

			// Reload from server
			const response = await fetch("/api/kanban/columns");

			$.set(columns, await response.json(), true);
		}
	}

	async function handleAddCard(col) {
		const title = prompt(`Add card to ${col.title}:`);

		if (!title?.trim()) return;

		try {
			const response = await fetch("/api/kanban/cards", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ title: title.trim(), columnId: col.id })
			});

			if (!response.ok) throw new Error("Failed to create card");

			const newCard = await response.json();

			$.set(
				columns,
				$.get(columns).map((column) => column.id === col.id
					? { ...column, cards: [...column.cards, newCard] }
					: column),
				true
			);
		} catch(e) {
			alert("Failed to create card. Please try again.");
		}
	}

	var div = root_2();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();

			$.append($$anchor, div_1);
		};

		var consequent_1 = ($$anchor) => {
			var div_2 = root_1();
			var text = $.only_child(div_2);

			$.template_effect(() => $.set_text(text, `Error: ${$.get(error) ?? ''}`));
			$.append($$anchor, div_2);
		};

		var alternate = ($$anchor) => {
			KanbanBoard($$anchor, {
				onMove: handleMove,
				onAddCard: handleAddCard,
				get columns() {
					return $.get(columns);
				},

				set columns($$value) {
					$.set(columns, $$value, true);
				}
			});
		};

		$.if(node, ($$render) => {
			if ($.get(loading)) $$render(consequent); else if ($.get(error)) $$render(consequent_1, 1); else $$render(alternate, -1);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}
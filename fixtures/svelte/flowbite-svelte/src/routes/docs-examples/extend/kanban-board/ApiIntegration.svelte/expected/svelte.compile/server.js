import * as $ from 'svelte/internal/server';
import { KanbanBoard } from "flowbite-svelte";
import { onMount } from "svelte";

export default function ApiIntegration($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let columns = [];
		let loading = true;
		let error = null;

		onMount(async () => {
			try {
				const response = await fetch("/api/kanban/columns");

				if (!response.ok) throw new Error("Failed to load board");

				columns = await response.json();
			} catch(e) {
				error = e instanceof Error ? e.message : "Unknown error";
			} finally {
				loading = false;
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

				columns = await response.json();
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

				columns = columns.map((column) => column.id === col.id
					? { ...column, cards: [...column.cards, newCard] }
					: column);
			} catch(e) {
				alert("Failed to create card. Please try again.");
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="bg-white p-4 dark:bg-gray-800">`);

			if (loading) {
				$$renderer.push(`<!--[0--><div class="flex h-64 items-center justify-center"><div class="text-gray-600">Loading board...</div></div>`);
			} else if (error) {
				$$renderer.push(`<!--[1--><div class="rounded border border-red-200 bg-red-50 p-4 text-red-800">Error: ${$.escape(error)}</div>`);
			} else {
				$$renderer.push('<!--[-1-->');

				KanbanBoard($$renderer, {
					onMove: handleMove,
					onAddCard: handleAddCard,
					get columns() {
						return columns;
					},

					set columns($$value) {
						columns = $$value;
						$$settled = false;
					}
				});
			}

			$$renderer.push(`<!--]--></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}
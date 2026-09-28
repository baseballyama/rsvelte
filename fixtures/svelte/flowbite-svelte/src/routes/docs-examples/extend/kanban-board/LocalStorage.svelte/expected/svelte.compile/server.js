import * as $ from 'svelte/internal/server';
import { KanbanBoard, Button } from "flowbite-svelte";
import { onMount } from "svelte";

export default function LocalStorage($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const STORAGE_KEY = "my-kanban-board";

		let columns = [
			{ id: "todo", title: "To Do", color: "#ef4444", cards: [] },
			{ id: "doing", title: "Doing", color: "#f59e0b", cards: [] },
			{ id: "done", title: "Done", color: "#10b981", cards: [] }
		];

		// Load from localStorage on mount
		onMount(() => {
			const saved = localStorage.getItem(STORAGE_KEY);

			if (saved) {
				try {
					columns = JSON.parse(saved);
				} catch(e) {
					console.error("Failed to load saved board:", e);
				}
			}
		});

		// Save to localStorage whenever columns change
		function handleMove(card, from, to) {
			console.log(`Moved "${card.title}" from "${from.title}" to "${to.title}"`);
		}

		function handleAddCard(col) {
			const title = prompt(`New task for ${col.title}:`);

			if (!title?.trim()) return;

			columns = columns.map((column) => column.id === col.id
				? {
					...column,
					cards: [
						...column.cards,
						{ id: Date.now(), title: title.trim(), tags: ["new"] }
					]
				}
				: column);
		}

		function clearBoard() {
			if (confirm("Clear all cards? This cannot be undone.")) {
				columns = columns.map((col) => ({ ...col, cards: [] }));
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="p-4"><div class="mb-4 flex items-center justify-between"><h1 class="text-2xl font-bold dark:text-white">My Tasks</h1> `);

			Button($$renderer, {
				onclick: clearBoard,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Clear Board`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			KanbanBoard($$renderer, {
				onMove: handleMove,
				onAddCard: handleAddCard,
				classes: {
					column: "dark:bg-gray-800 shadow-lg",
					card: "hover:shadow-xl transition-shadow",
					cardTitle: "dark:text-white font-bold",
					addButton: "bg-primary-500 hover:bg-primary-600 text-white dark:text-white"
				},

				get columns() {
					return columns;
				},

				set columns($$value) {
					columns = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}
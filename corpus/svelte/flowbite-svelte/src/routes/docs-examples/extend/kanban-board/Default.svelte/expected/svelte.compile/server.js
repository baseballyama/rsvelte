import * as $ from 'svelte/internal/server';
import { KanbanBoard, Heading, P } from "flowbite-svelte";

export default function Default($$renderer) {
	let columns = [
		{
			id: "todo",
			title: "To Do",
			color: "#ef4444",
			cards: [
				{
					id: 1,
					title: "Design new landing page",
					description: "Create mockups for the homepage redesign",
					tags: ["design", "urgent"]
				},

				{
					id: 2,
					title: "Update documentation",
					description: "Add API examples to the docs",
					tags: ["docs"]
				}
			]
		},

		{
			id: "in-progress",
			title: "In Progress",
			color: "#f59e0b",
			cards: [
				{
					id: 3,
					title: "Implement authentication",
					description: "Add JWT-based auth system",
					tags: ["backend", "security"]
				}
			]
		},

		{
			id: "review",
			title: "Review",
			color: "#8b5cf6",
			cards: [
				{ id: 4, title: "Code review: Payment flow", tags: ["review"] }
			]
		},

		{
			id: "done",
			title: "Done",
			color: "#10b981",
			cards: [
				{
					id: 5,
					title: "Setup CI/CD pipeline",
					description: "Configure GitHub Actions",
					tags: ["devops"]
				},

				{
					id: 6,
					title: "Database migration",
					tags: ["backend", "completed"]
				}
			]
		}
	];

	function handleMove(card, from, to) {
		console.log(`Moved "${card.title}" from "${from.title}" to "${to.title}"`);

		// Here you could make an API call to persist the change
		// await fetch('/api/cards/move', { method: 'POST', body: JSON.stringify({ cardId: card.id, fromId: from.id, toId: to.id }) })
	}

	function handleAddCard(col) {
		// Note: Using prompt() for demo - use proper form UI in production
		const cardTitle = prompt(`Add a new card to "${col.title}":`);

		if (!cardTitle?.trim()) return;

		const newCard = {
			// Note: Using timestamp for demo - use proper ID generation in production
			id: Date.now(),
			title: cardTitle.trim(),
			tags: ["new"]
		};

		columns = columns.map((column) => column.id === col.id
			? { ...column, cards: [...column.cards, newCard] }
			: column);

		// Here you could make an API call to persist the new card
		// await fetch('/api/cards', { method: 'POST', body: JSON.stringify(newCard) })
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="bg-gray-100 py-4 md:py-8 dark:bg-gray-800"><div class="mx-auto max-w-7xl px-2 sm:px-4"><div class="mb-4 md:mb-6">`);

		Heading($$renderer, {
			tag: 'h1',
			class: 'text-2xl md:text-3xl',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Project Kanban Board`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		P($$renderer, {
			class: 'mt-1 text-sm text-gray-600 md:mt-2 md:text-base',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Drag cards between columns to update their status`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> `);

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

		$$renderer.push(`<!----> <div class="mt-6 grid grid-cols-2 gap-3 md:mt-8 md:grid-cols-4 md:gap-4"><!--[-->`);

		const each_array = $.ensure_array_like(columns);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let col = each_array[$$index];

			$$renderer.push(`<div class="rounded-lg bg-white p-3 shadow-sm md:p-4"><div class="text-xs text-gray-600 md:text-sm">${$.escape(col.title)}</div> <div class="mt-1 text-xl font-bold text-gray-900 md:text-2xl">${$.escape(col.cards.length)}</div></div>`);
		}

		$$renderer.push(`<!--]--></div></div></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { KanbanBoard, Heading, P } from "flowbite-svelte";

var root = $.from_html(`<div class="rounded-lg bg-white p-3 shadow-sm md:p-4"><div class="text-xs text-gray-600 md:text-sm"> </div> <div class="mt-1 text-xl font-bold text-gray-900 md:text-2xl"> </div></div>`);
var root_1 = $.from_html(`<div class="bg-gray-100 py-4 md:py-8 dark:bg-gray-800"><div class="mx-auto max-w-7xl px-2 sm:px-4"><div class="mb-4 md:mb-6"><!> <!></div> <!> <div class="mt-6 grid grid-cols-2 gap-3 md:mt-8 md:grid-cols-4 md:gap-4"></div></div></div>`);

export default function Default($$anchor) {
	let columns = $.state($.proxy([
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
	]));

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

		$.set(
			columns,
			$.get(columns).map((column) => column.id === col.id
				? { ...column, cards: [...column.cards, newCard] }
				: column),
			true
		);

		// Here you could make an API call to persist the new card
		// await fetch('/api/cards', { method: 'POST', body: JSON.stringify(newCard) })
	}

	var div = root_1();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	Heading(node, {
		tag: 'h1',
		class: 'text-2xl md:text-3xl',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Project Kanban Board');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	P(node_1, {
		class: 'mt-1 text-sm text-gray-600 md:mt-2 md:text-base',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Drag cards between columns to update their status');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);

	var node_2 = $.sibling(div_2, 2);

	KanbanBoard(node_2, {
		onMove: handleMove,
		onAddCard: handleAddCard,
		get columns() {
			return $.get(columns);
		},

		set columns($$value) {
			$.set(columns, $$value, true);
		}
	});

	var div_3 = $.sibling(node_2, 2);

	$.each(div_3, 21, () => $.get(columns), (col) => col.id, ($$anchor, col) => {
		var div_4 = root();
		var div_5 = $.child(div_4);
		var text_2 = $.only_child(div_5, true);
		var div_6 = $.sibling(div_5, 2);
		var text_3 = $.only_child(div_6, true);

		$.reset(div_4);

		$.template_effect(() => {
			$.set_text(text_2, $.get(col).title);
			$.set_text(text_3, $.get(col).cards.length);
		});

		$.append($$anchor, div_4);
	});

	$.reset(div_3);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}
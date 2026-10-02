import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { KanbanBoard, Button } from "flowbite-svelte";
import { onMount } from "svelte";

var root = $.from_html(`<div class="p-4"><div class="mb-4 flex items-center justify-between"><h1 class="text-2xl font-bold dark:text-white">My Tasks</h1> <!></div> <!></div>`);

export default function LocalStorage($$anchor, $$props) {
	$.push($$props, true);

	const STORAGE_KEY = "my-kanban-board";

	let columns = $.state($.proxy([
		{ id: "todo", title: "To Do", color: "#ef4444", cards: [] },
		{ id: "doing", title: "Doing", color: "#f59e0b", cards: [] },
		{ id: "done", title: "Done", color: "#10b981", cards: [] }
	]));

	// Load from localStorage on mount
	onMount(() => {
		const saved = localStorage.getItem(STORAGE_KEY);

		if (saved) {
			try {
				$.set(columns, JSON.parse(saved), true);
			} catch(e) {
				console.error("Failed to load saved board:", e);
			}
		}
	});

	// Save to localStorage whenever columns change
	$.user_effect(() => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify($.get(columns)));
	});

	function handleMove(card, from, to) {
		console.log(`Moved "${card.title}" from "${from.title}" to "${to.title}"`);
	}

	function handleAddCard(col) {
		const title = prompt(`New task for ${col.title}:`);

		if (!title?.trim()) return;

		$.set(
			columns,
			$.get(columns).map((column) => column.id === col.id
				? {
					...column,
					cards: [
						...column.cards,
						{ id: Date.now(), title: title.trim(), tags: ["new"] }
					]
				}
				: column),
			true
		);
	}

	function clearBoard() {
		if (confirm("Clear all cards? This cannot be undone.")) {
			$.set(columns, $.get(columns).map((col) => ({ ...col, cards: [] })), true);
		}
	}

	var div = root();
	var div_1 = $.child(div);
	var node = $.sibling($.child(div_1), 2);

	Button(node, {
		onclick: clearBoard,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Clear Board');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var node_1 = $.sibling(div_1, 2);

	KanbanBoard(node_1, {
		onMove: handleMove,
		onAddCard: handleAddCard,
		classes: {
			column: "dark:bg-gray-800 shadow-lg",
			card: "hover:shadow-xl transition-shadow",
			cardTitle: "dark:text-white font-bold",
			addButton: "bg-primary-500 hover:bg-primary-600 text-white dark:text-white"
		},

		get columns() {
			return $.get(columns);
		},

		set columns($$value) {
			$.set(columns, $$value, true);
		}
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}
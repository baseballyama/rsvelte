import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { KanbanBoard, Modal, Label, Input, Textarea, Button } from "flowbite-svelte";

var root = $.from_html(`<span>Title *</span> <!>`, 1);
var root_1 = $.from_html(`<span>Description</span> <!>`, 1);
var root_2 = $.from_html(`<span>Tags</span> <!> <p class="text-sm text-gray-500 dark:text-gray-400">Separate tags with commas</p>`, 1);
var root_3 = $.from_html(`<div class="flex flex-col space-y-6"><h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white"> </h3> <!> <!> <!> <!> <!></div>`);
var root_4 = $.from_html(`<!> <!>`, 1);

export default function UsingModal($$anchor, $$props) {
	$.push($$props, true);

	let columns = $.state($.proxy([
		{
			id: "backlog",
			title: "Backlog",
			color: "#6b7280",
			cards: [
				{ id: 1, title: "Research user feedback", tags: ["research"] }
			]
		},

		{
			id: "active",
			title: "Active Sprint",
			color: "#3b82f6",
			cards: [
				{
					id: 2,
					title: "Build feature X",
					description: "Sprint 24",
					tags: ["dev", "high-priority"]
				}
			]
		},
		{ id: "done", title: "Completed", color: "#22c55e", cards: [] }
	]));

	let formModal = $.state(false);
	let currentColumn = $.state(null);
	let error = $.state("");

	function handleMove() {
		$.set(columns, [...$.get(columns)], true);
	}

	function handleAddCard(col) {
		$.set(currentColumn, col, true);
		$.set(formModal, true);
		$.set(error, "");
	}

	function onaction({ action, data }) {
		$.set(error, "");

		if (action === "addCard") {
			const title = data.get("title");
			const description = data.get("description");
			const tagsInput = data.get("tags");

			// Validate title
			if (!title?.trim()) {
				$.set(error, "Title is required");

				return false;
			}

			// Parse tags
			const tags = tagsInput?.trim()
				? tagsInput.split(",").map((tag) => tag.trim()).filter(Boolean)
				: undefined;

			// Add card to column
			if ($.get(currentColumn)) {
				$.set(
					columns,
					$.get(columns).map((column) => column.id === $.get(currentColumn).id
						? {
							...column,
							cards: [
								...column.cards,
								{
									id: crypto.randomUUID(),
									title: title.trim(),
									description: description?.trim() || undefined,
									tags
								}
							]
						}
						: column),
					true
				);
			}

			// Reset current column
			$.set(currentColumn, null);
		}
	}

	var fragment = root_4();
	var node = $.first_child(fragment);

	KanbanBoard(node, {
		onMove: handleMove,
		onAddCard: handleAddCard,
		classes: {
			column: "dark:bg-gray-800 shadow-lg",
			card: "hover:shadow-xl transition-shadow",
			cardTitle: "text-blue-600 font-bold",
			addButton: "bg-blue-500 hover:bg-blue-600 text-white dark:text-white",
			cardTags: "text-gray-900"
		},

		get columns() {
			return $.get(columns);
		},

		set columns($$value) {
			$.set(columns, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	Modal(node_1, {
		form: true,
		size: 'sm',
		onaction,
		get open() {
			return $.get(formModal);
		},

		set open($$value) {
			$.set(formModal, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var div = root_3();
			var h3 = $.child(div);
			var text = $.only_child(h3);
			var node_2 = $.sibling(h3, 2);

			{
				var consequent = ($$anchor) => {
					Label($$anchor, {
						color: 'red',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text();

							$.template_effect(() => $.set_text(text_1, $.get(error)));
							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				};

				$.if(node_2, ($$render) => {
					if ($.get(error)) $$render(consequent);
				});
			}

			var node_3 = $.sibling(node_2, 2);

			Label(node_3, {
				class: 'space-y-2',
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root();
					var node_4 = $.sibling($.first_child(fragment_3), 2);

					Input(node_4, {
						type: 'text',
						name: 'title',
						placeholder: 'Enter card title',
						required: true
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_3, 2);

			Label(node_5, {
				class: 'space-y-2',
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_1();
					var node_6 = $.sibling($.first_child(fragment_4), 2);

					Textarea(node_6, {
						name: 'description',
						placeholder: 'Enter description (optional)',
						rows: 3,
						class: 'w-full'
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_5, 2);

			Label(node_7, {
				class: 'space-y-2',
				children: ($$anchor, $$slotProps) => {
					var fragment_5 = root_2();
					var node_8 = $.sibling($.first_child(fragment_5), 2);

					Input(node_8, { type: 'text', name: 'tags', placeholder: 'tag1, tag2, tag3' });
					$.next(2);
					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});

			var node_9 = $.sibling(node_7, 2);

			Button(node_9, {
				type: 'submit',
				value: 'addCard',
				class: 'w-full',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Add Card');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			$.reset(div);
			$.template_effect(() => $.set_text(text, `Add Card to ${$.get(currentColumn)?.title ?? ''}`));
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}
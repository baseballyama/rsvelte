import * as $ from 'svelte/internal/server';
import { KanbanBoard, Modal, Label, Input, Textarea, Button } from "flowbite-svelte";

export default function UsingModal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let columns = [
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
		];

		let formModal = false;
		let currentColumn = null;
		let error = "";

		function handleMove() {
			columns = [...columns];
		}

		function handleAddCard(col) {
			currentColumn = col;
			formModal = true;
			error = "";
		}

		function onaction({ action, data }) {
			error = "";

			if (action === "addCard") {
				const title = data.get("title");
				const description = data.get("description");
				const tagsInput = data.get("tags");

				// Validate title
				if (!title?.trim()) {
					error = "Title is required";

					return false;
				}

				// Parse tags
				const tags = tagsInput?.trim()
					? tagsInput.split(",").map((tag) => tag.trim()).filter(Boolean)
					: undefined;

				// Add card to column
				if (currentColumn) {
					columns = columns.map((column) => column.id === currentColumn.id
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
						: column);
				}

				// Reset current column
				currentColumn = null;
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			KanbanBoard($$renderer, {
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
					return columns;
				},

				set columns($$value) {
					columns = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Modal($$renderer, {
				form: true,
				size: 'sm',
				onaction,
				get open() {
					return formModal;
				},

				set open($$value) {
					formModal = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					$$renderer.push(`<div class="flex flex-col space-y-6"><h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">Add Card to ${$.escape(currentColumn?.title)}</h3> `);

					if (error) {
						$$renderer.push('<!--[0-->');

						Label($$renderer, {
							color: 'red',
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(error)}`);
							},
							$$slots: { default: true }
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					Label($$renderer, {
						class: 'space-y-2',
						children: ($$renderer) => {
							$$renderer.push(`<span>Title *</span> `);

							Input($$renderer, {
								type: 'text',
								name: 'title',
								placeholder: 'Enter card title',
								required: true
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Label($$renderer, {
						class: 'space-y-2',
						children: ($$renderer) => {
							$$renderer.push(`<span>Description</span> `);

							Textarea($$renderer, {
								name: 'description',
								placeholder: 'Enter description (optional)',
								rows: 3,
								class: 'w-full'
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Label($$renderer, {
						class: 'space-y-2',
						children: ($$renderer) => {
							$$renderer.push(`<span>Tags</span> `);
							Input($$renderer, { type: 'text', name: 'tags', placeholder: 'tag1, tag2, tag3' });
							$$renderer.push(`<!----> <p class="text-sm text-gray-500 dark:text-gray-400">Separate tags with commas</p>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						type: 'submit',
						value: 'addCard',
						class: 'w-full',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Add Card`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}
import * as $ from 'svelte/internal/server';

import {
	StructuredList,
	StructuredListBody,
	StructuredListCell,
	StructuredListHead,
	StructuredListInput,
	StructuredListRow
} from "carbon-components-svelte";

export default function StructuredListMultiSelect($$renderer) {
	const databases = [
		{
			id: "postgresql",
			name: "PostgreSQL",
			type: "Relational",
			description: "Open-source object-relational database known for reliability, extensibility, and strong SQL standards compliance."
		},

		{
			id: "mongodb",
			name: "MongoDB",
			type: "Document",
			description: "Document-oriented NoSQL database designed for flexible schemas and horizontal scaling across distributed clusters."
		},

		{
			id: "redis",
			name: "Redis",
			type: "Key-value",
			description: "In-memory key-value store used as a cache, message broker, and real-time data platform with sub-millisecond latency."
		}
	];

	let selected = ["postgresql-value", "redis-value"];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		StructuredList($$renderer, {
			selection: true,
			multiple: true,
			get selected() {
				return selected;
			},

			set selected($$value) {
				selected = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				StructuredListHead($$renderer, {
					children: ($$renderer) => {
						StructuredListRow($$renderer, {
							head: true,
							children: ($$renderer) => {
								StructuredListCell($$renderer, {
									head: true,
									children: ($$renderer) => {
										$$renderer.push(`<!---->Name`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								StructuredListCell($$renderer, {
									head: true,
									children: ($$renderer) => {
										$$renderer.push(`<!---->Type`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								StructuredListCell($$renderer, {
									head: true,
									children: ($$renderer) => {
										$$renderer.push(`<!---->Description`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				StructuredListBody($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(databases);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let db = each_array[$$index];

							StructuredListRow($$renderer, {
								label: true,
								for: `multi-${$.stringify(db.id)}`,
								children: ($$renderer) => {
									StructuredListCell($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(db.name)}`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									StructuredListCell($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(db.type)}`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									StructuredListCell($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(db.description)}`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									StructuredListInput($$renderer, {
										id: `multi-${$.stringify(db.id)}`,
										value: `${$.stringify(db.id)}-value`,
										title: `${$.stringify(db.name)} option`
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div style="margin-top: 1rem;">Selected: <strong>${$.escape(selected.join(", ") || "None")}</strong></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}
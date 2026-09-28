import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	StructuredList,
	StructuredListBody,
	StructuredListCell,
	StructuredListHead,
	StructuredListInput,
	StructuredListRow
} from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<!> <div style="margin-top: 1rem;">Selected: <strong> </strong></div>`, 1);

export default function StructuredListMultiSelect($$anchor) {
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
	var fragment = root_3();
	var node = $.first_child(fragment);

	StructuredList(node, {
		selection: true,
		multiple: true,
		get selected() {
			return selected;
		},

		set selected($$value) {
			selected = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node_1 = $.first_child(fragment_1);

			StructuredListHead(node_1, {
				children: ($$anchor, $$slotProps) => {
					StructuredListRow($$anchor, {
						head: true,
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_2 = $.first_child(fragment_3);

							StructuredListCell(node_2, {
								head: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Name');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});

							var node_3 = $.sibling(node_2, 2);

							StructuredListCell(node_3, {
								head: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Type');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});

							var node_4 = $.sibling(node_3, 2);

							StructuredListCell(node_4, {
								head: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Description');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_1, 2);

			StructuredListBody(node_5, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = $.comment();
					var node_6 = $.first_child(fragment_4);

					$.each(node_6, 17, () => databases, $.index, ($$anchor, db) => {
						StructuredListRow($$anchor, {
							label: true,
							get for() {
								return `multi-${$.get(db).id ?? ''}`;
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_6 = root_1();
								var node_7 = $.first_child(fragment_6);

								StructuredListCell(node_7, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text();

										$.template_effect(() => $.set_text(text_3, $.get(db).name));
										$.append($$anchor, text_3);
									},
									$$slots: { default: true }
								});

								var node_8 = $.sibling(node_7, 2);

								StructuredListCell(node_8, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_4 = $.text();

										$.template_effect(() => $.set_text(text_4, $.get(db).type));
										$.append($$anchor, text_4);
									},
									$$slots: { default: true }
								});

								var node_9 = $.sibling(node_8, 2);

								StructuredListCell(node_9, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_5 = $.text();

										$.template_effect(() => $.set_text(text_5, $.get(db).description));
										$.append($$anchor, text_5);
									},
									$$slots: { default: true }
								});

								var node_10 = $.sibling(node_9, 2);

								StructuredListInput(node_10, {
									get id() {
										return `multi-${$.get(db).id ?? ''}`;
									},

									get value() {
										return `${$.get(db).id ?? ''}-value`;
									},

									get title() {
										return `${$.get(db).name ?? ''} option`;
									}
								});

								$.append($$anchor, fragment_6);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var strong = $.sibling($.child(div));
	var text_6 = $.only_child(strong, true);

	$.reset(div);
	$.template_effect(($0) => $.set_text(text_6, $0), [() => selected.join(", ") || "None"]);
	$.append($$anchor, fragment);
}
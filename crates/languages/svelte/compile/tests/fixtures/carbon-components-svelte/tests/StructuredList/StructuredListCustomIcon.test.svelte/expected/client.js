import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import StructuredList from "carbon-components-svelte/StructuredList/StructuredList.svelte";
import StructuredListBody from "carbon-components-svelte/StructuredList/StructuredListBody.svelte";
import StructuredListCell from "carbon-components-svelte/StructuredList/StructuredListCell.svelte";
import StructuredListHead from "carbon-components-svelte/StructuredList/StructuredListHead.svelte";
import StructuredListInput from "carbon-components-svelte/StructuredList/StructuredListInput.svelte";
import StructuredListRow from "carbon-components-svelte/StructuredList/StructuredListRow.svelte";
import CheckmarkOutline from "carbon-icons-svelte/lib/CheckmarkOutline.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function StructuredListCustomIcon_test($$anchor) {
	StructuredList($$anchor, {
		selection: true,
		get icon() {
			return CheckmarkOutline;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			StructuredListHead(node, {
				children: ($$anchor, $$slotProps) => {
					StructuredListRow($$anchor, {
						head: true,
						children: ($$anchor, $$slotProps) => {
							StructuredListCell($$anchor, {
								head: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Column A');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			StructuredListBody(node_1, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = $.comment();
					var node_2 = $.first_child(fragment_4);

					$.each(node_2, 16, () => ["1", "2", "3"], $.index, ($$anchor, item) => {
						StructuredListRow($$anchor, {
							label: true,
							get for() {
								return `row-${item ?? ''}`;
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_6 = root();
								var node_3 = $.first_child(fragment_6);

								StructuredListCell(node_3, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text();

										$.template_effect(() => $.set_text(text_1, `Row ${item ?? ''}`));
										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});

								var node_4 = $.sibling(node_3, 2);

								StructuredListInput(node_4, {
									get id() {
										return `row-${item ?? ''}`;
									},

									get value() {
										return `row-${item ?? ''}-value`;
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
}
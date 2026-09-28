import * as $ from 'svelte/internal/server';
import StructuredList from "carbon-components-svelte/StructuredList/StructuredList.svelte";
import StructuredListBody from "carbon-components-svelte/StructuredList/StructuredListBody.svelte";
import StructuredListCell from "carbon-components-svelte/StructuredList/StructuredListCell.svelte";
import StructuredListHead from "carbon-components-svelte/StructuredList/StructuredListHead.svelte";
import StructuredListInput from "carbon-components-svelte/StructuredList/StructuredListInput.svelte";
import StructuredListRow from "carbon-components-svelte/StructuredList/StructuredListRow.svelte";
import CheckmarkOutline from "carbon-icons-svelte/lib/CheckmarkOutline.svelte";

export default function StructuredListCustomIcon_test($$renderer) {
	StructuredList($$renderer, {
		selection: true,
		icon: CheckmarkOutline,
		children: ($$renderer) => {
			StructuredListHead($$renderer, {
				children: ($$renderer) => {
					StructuredListRow($$renderer, {
						head: true,
						children: ($$renderer) => {
							StructuredListCell($$renderer, {
								head: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Column A`);
								},
								$$slots: { default: true }
							});
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

					const each_array = $.ensure_array_like(["1", "2", "3"]);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let item = each_array[$$index];

						StructuredListRow($$renderer, {
							label: true,
							for: `row-${$.stringify(item)}`,
							children: ($$renderer) => {
								StructuredListCell($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Row ${$.escape(item)}`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								StructuredListInput($$renderer, {
									id: `row-${$.stringify(item)}`,
									value: `row-${$.stringify(item)}-value`
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
}
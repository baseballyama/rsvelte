import * as $ from 'svelte/internal/server';
import StructuredList from "carbon-components-svelte/StructuredList/StructuredList.svelte";
import StructuredListBody from "carbon-components-svelte/StructuredList/StructuredListBody.svelte";
import StructuredListCell from "carbon-components-svelte/StructuredList/StructuredListCell.svelte";
import StructuredListHead from "carbon-components-svelte/StructuredList/StructuredListHead.svelte";
import StructuredListRow from "carbon-components-svelte/StructuredList/StructuredListRow.svelte";

export default function StructuredListCustom_test($$renderer) {
	StructuredList($$renderer, {
		children: ($$renderer) => {
			StructuredListHead($$renderer, {
				children: ($$renderer) => {
					StructuredListRow($$renderer, {
						head: true,
						children: ($$renderer) => {
							StructuredListCell($$renderer, {
								head: true,
								children: ($$renderer) => {
									$$renderer.push(`<div data-testid="custom-header">Custom Header</div>`);
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
					StructuredListRow($$renderer, {
						children: ($$renderer) => {
							StructuredListCell($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<div data-testid="custom-content">Custom Content</div>`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}
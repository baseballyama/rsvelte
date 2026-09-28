import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import StructuredList from "carbon-components-svelte/StructuredList/StructuredList.svelte";
import StructuredListBody from "carbon-components-svelte/StructuredList/StructuredListBody.svelte";
import StructuredListCell from "carbon-components-svelte/StructuredList/StructuredListCell.svelte";
import StructuredListHead from "carbon-components-svelte/StructuredList/StructuredListHead.svelte";
import StructuredListRow from "carbon-components-svelte/StructuredList/StructuredListRow.svelte";

var root = $.from_html(`<div data-testid="custom-header">Custom Header</div>`);
var root_1 = $.from_html(`<div data-testid="custom-content">Custom Content</div>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function StructuredListCustom_test($$anchor) {
	StructuredList($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node = $.first_child(fragment_1);

			StructuredListHead(node, {
				children: ($$anchor, $$slotProps) => {
					StructuredListRow($$anchor, {
						head: true,
						children: ($$anchor, $$slotProps) => {
							StructuredListCell($$anchor, {
								head: true,
								children: ($$anchor, $$slotProps) => {
									var div = root();

									$.append($$anchor, div);
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
					StructuredListRow($$anchor, {
						children: ($$anchor, $$slotProps) => {
							StructuredListCell($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var div_1 = root_1();

									$.append($$anchor, div_1);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}
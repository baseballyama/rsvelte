import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import PaginationBasic from "./pagination-basic.svelte";
import PaginationSimple from "./pagination-simple.svelte";
import PaginationWithSelect from "./pagination-with-select.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Pagination($$anchor) {
	ExampleWrapper($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			PaginationBasic(node, {});

			var node_1 = $.sibling(node, 2);

			PaginationSimple(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			PaginationWithSelect(node_2, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}
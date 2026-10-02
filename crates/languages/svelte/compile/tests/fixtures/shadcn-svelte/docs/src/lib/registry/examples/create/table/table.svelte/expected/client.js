import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TableBasic from "./table-basic.svelte";
import TableSimple from "./table-simple.svelte";
import TableWithActions from "./table-with-actions.svelte";
import TableWithBadges from "./table-with-badges.svelte";
import TableWithFooter from "./table-with-footer.svelte";
import TableWithInput from "./table-with-input.svelte";
import TableWithSelect from "./table-with-select.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Table($$anchor) {
	ExampleWrapper($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			TableBasic(node, {});

			var node_1 = $.sibling(node, 2);

			TableWithFooter(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			TableSimple(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			TableWithBadges(node_3, {});

			var node_4 = $.sibling(node_3, 2);

			TableWithActions(node_4, {});

			var node_5 = $.sibling(node_4, 2);

			TableWithSelect(node_5, {});

			var node_6 = $.sibling(node_5, 2);

			TableWithInput(node_6, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}
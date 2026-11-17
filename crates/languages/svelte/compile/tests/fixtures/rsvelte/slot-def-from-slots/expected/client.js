import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<!> <!> <!>`, 1);
export default function Slot_def_from_slots($$anchor, $$props) {
	$.push($$props, true);
	const rest = { extra: 1 };
	var fragment = root();
	var node = $.first_child(fragment);
	$.slot(node, $$props, "default", {
		get first() {
			return $$props.items[0];
		},
		label: "text",
		get mixed() {
			return `a ${$$props.items.length ?? ""}`;
		}
	}, null);
	var node_1 = $.sibling(node, 2);
	$.each(node_1, 17, () => $$props.items, $.index, ($$anchor, item) => {
		var fragment_1 = $.comment();
		var node_2 = $.first_child(fragment_1);
		$.slot(node_2, $$props, "row", $.spread_props({ get item() {
			return $.get(item);
		} }, () => rest), null);
		$.append($$anchor, fragment_1);
	});
	var node_3 = $.sibling(node_1, 2);
	$.slot(node_3, $$props, "footer", { class: 1 }, null);
	$.append($$anchor, fragment);
	$.pop();
}

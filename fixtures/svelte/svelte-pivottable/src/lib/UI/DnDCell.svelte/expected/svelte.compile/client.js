import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from "svelte";
import { getSort } from "../Utilities";
import DraggableAttribute from "./DraggableAttribute.svelte";
import sortableAttachment from "./SortableAttachment";

var root = $.from_html(`<div></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function DnDCell($$anchor, $$props) {
	$.push($$props, true);

	const options = {
		group: "shared",
		ghostClass: "pvtPlaceholder",
		filter: ".pvtFilterBox",
		preventOnFilter: false,
		revertOnSpill: true, // Enable plugin
		removeOnSpill: false // Disable plugin
	};

	function getAttrValues(x) {
		const values = $$props.attrValues[x] ?? {},
			sorter = getSort($$props.sorters, x);

		return Object.keys(values).sort(sorter);
	}

	let initialized = $.state(false);

	onMount(() => {
		// onMount is afer the attachments
		$.set(initialized, true);
	});

	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.attach(div, () => sortableAttachment(options, $$props.onChange));
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (!$.get(initialized)) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	$.each(node_1, 17, () => $$props.items, $.index, ($$anchor, name) => {
		{
			let $0 = $.derived(() => getAttrValues($.get(name)));

			DraggableAttribute($$anchor, {
				get attrValues() {
					return $.get($0);
				},

				get name() {
					return $.get(name);
				},

				get menuLimit() {
					return $$props.menuLimit;
				}
			});
		}
	});

	$.append($$anchor, fragment);
	$.pop();
}
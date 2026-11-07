import * as $ from 'svelte/internal/server';
import { onMount } from "svelte";
import { getSort } from "../Utilities";
import DraggableAttribute from "./DraggableAttribute.svelte";
import sortableAttachment from "./SortableAttachment";

export default function DnDCell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { items, onChange, attrValues, sorters, menuLimit } = $$props;

		const options = {
			group: "shared",
			ghostClass: "pvtPlaceholder",
			filter: ".pvtFilterBox",
			preventOnFilter: false,
			revertOnSpill: true, // Enable plugin
			removeOnSpill: false // Disable plugin
		};

		function getAttrValues(x) {
			const values = attrValues[x] ?? {},
				sorter = getSort(sorters, x);

			return Object.keys(values).sort(sorter);
		}

		let initialized = false;

		onMount(() => {
			// onMount is afer the attachments
			initialized = true;
		});

		if (!initialized) {
			$$renderer.push(`<!--[0--><div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <!--[-->`);

		const each_array = $.ensure_array_like(items);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let name = each_array[$$index];

			DraggableAttribute($$renderer, { attrValues: getAttrValues(name), name, menuLimit });
		}

		$$renderer.push(`<!--]-->`);
	});
}
import * as $ from 'svelte/internal/server';
import { getContext } from "svelte";
import Draggable from "./Draggable.svelte";
import FilterBox from "./FilterBox.svelte";

export default function DraggableAttribute($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { name, attrValues, menuLimit } = $$props;
		let open = false;
		let valueFilter = getContext("valueFilter");
		let is_empty = $.derived(() => valueFilter[name] ? Object.keys(valueFilter[name]).length === 0 : true);
		const toggleOpen = () => open = !open;

		$$renderer.push(`<li${$.attr('data-id', name)} class="handle"><span${$.attr_class(`pvtAttr ${is_empty() ? "" : "pvtFilteredAttribute"}`)}>${$.escape(name)} <span class="pvtTriangle" role="presentation"> 
            ▾</span></span> `);

		if (open) {
			$$renderer.push('<!--[0-->');

			Draggable($$renderer, {
				handle: '.pvtDragHandle',
				close: '.pvtCloseX',
				onclose: toggleOpen,
				children: ($$renderer) => {
					FilterBox($$renderer, { name, values: attrValues, menuLimit });
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></li>`);
	});
}
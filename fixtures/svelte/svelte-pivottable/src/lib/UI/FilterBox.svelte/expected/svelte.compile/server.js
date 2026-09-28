import * as $ from 'svelte/internal/server';
import { getContext } from "svelte";

let zIndexGlobal = 1000;

export default function FilterBox($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { name, values, menuLimit = 500 } = $$props;
		let globalFilter = getContext("valueFilter");
		let valueFilter = globalFilter[name] ?? {};
		let filterText = "";
		let shown = $.derived(() => values.filter(matchesFilter, filterText)); // filterText only to trigger reactivity

		function toggleValue(value) {
			value in valueFilter
				? removeValuesFromFilter([value])
				: addValuesToFilter([value]);
		}

		function setValuesInFilter(values) {
			Object.keys(valueFilter).forEach((key) => delete valueFilter[key]);
			addValuesToFilter(values);

			// values.forEach((v) => (valueFilter[v] = true));
		}

		function addValuesToFilter(values) {
			values.forEach((v) => valueFilter[v] = true);
			globalFilter[name] = valueFilter;
		}

		function removeValuesFromFilter(values) {
			values.forEach((v) => delete valueFilter[v]);
			globalFilter[name] = valueFilter;
		}

		function matchesFilter(x) {
			return x.toLowerCase().trim().includes(filterText.toLowerCase().trim());
		}

		function selectOnly(ev, value) {
			ev.preventDefault();
			ev.stopPropagation();
			setValuesInFilter(values.filter((y) => y !== value));
		}

		function select(all) {
			const func = all ? removeValuesFromFilter : addValuesToFilter;

			return function (ev) {
				ev.stopPropagation();
				func(values.filter(matchesFilter));
			};
		}

		function init(node) {
			node.style.zIndex = "" + zIndexGlobal++;
		}

		$$renderer.push(`<div class="pvtFilterBox"${$.attr_style('', { display: 'block', cursor: 'initial' })}><span class="pvtCloseX">×</span> <span class="pvtDragHandle">☰</span> <h4>${$.escape(name)}</h4> `);

		if (values.length < menuLimit) {
			$$renderer.push(`<!--[0--><p><input type="text" placeholder="Filter values" class="pvtSearch"${$.attr('value', filterText)}/> <br/> <button class="pvtButton">Select ${$.escape(values.length === shown().length ? "All" : shown().length)}</button>  <button class="pvtButton">Deselect ${$.escape(values.length === shown().length ? "All" : shown().length)}</button></p> <div class="pvtCheckContainer"><!--[-->`);

			const each_array = $.ensure_array_like(shown());

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let x = each_array[$$index];

				$$renderer.push(`<p${$.attr_class($.clsx(x in valueFilter ? "" : "selected"))}><a class="pvtOnly" role="presentation">only</a> <span class="pvtOnlySpacer"> </span> `);

				if (x === "") {
					$$renderer.push(`<!--[0--><em>null</em>`);
				} else {
					$$renderer.push(`<!--[-1-->${$.escape(x)}`);
				}

				$$renderer.push(`<!--]--></p>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push(`<!--[-1--><p>(too many values to show)</p>`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}
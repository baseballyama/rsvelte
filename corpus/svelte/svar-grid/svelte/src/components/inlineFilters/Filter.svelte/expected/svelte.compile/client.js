import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from "svelte";
import { filters } from "./filters";

export default function Filter($$anchor, $$props) {
	$.push($$props, true);

	const $filterValues = () => $.store_get(filterValues, '$filterValues', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const api = getContext("grid-store");
	const { filterValues } = api.getReactiveState();

	function filterRows(data) {
		api.exec("filter-rows", data);
	}

	const SvelteComponent = $.derived(() => filters[$$props.filter.type]);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => $.get(SvelteComponent), ($$anchor, SvelteComponent_1) => {
		SvelteComponent_1($$anchor, {
			get filter() {
				return $$props.filter;
			},

			get column() {
				return $$props.column;
			},
			action: filterRows,
			get filterValue() {
				return $filterValues()[$$props.column.id];
			}
		});
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}
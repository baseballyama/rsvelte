import * as $ from 'svelte/internal/server';
import { getContext } from "svelte";
import { filters } from "./filters";

export default function Filter($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { filter, column } = $$props;
		const api = getContext("grid-store");
		const { filterValues } = api.getReactiveState();

		function filterRows(data) {
			api.exec("filter-rows", data);
		}

		const SvelteComponent = $.derived(() => filters[filter.type]);

		if (SvelteComponent()) {
			$$renderer.push('<!--[-->');

			SvelteComponent()($$renderer, {
				filter,
				column,
				action: filterRows,
				filterValue: $.store_get($$store_subs ??= {}, '$filterValues', filterValues)[column.id]
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}
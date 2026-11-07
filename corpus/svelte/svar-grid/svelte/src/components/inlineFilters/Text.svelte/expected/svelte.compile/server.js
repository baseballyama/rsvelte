import * as $ from 'svelte/internal/server';
import { Text } from "@svar-ui/svelte-core";

export default function Text_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { filter, column, action, filterValue } = $$props;

		function filterRows({ value }) {
			action({ value, key: column.id });
		}

		Text($$renderer, $.spread_props([
			filter.config ?? {},
			{ value: filterValue, onchange: filterRows }
		]));
	});
}
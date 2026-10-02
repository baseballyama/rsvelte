import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Text } from "@svar-ui/svelte-core";

export default function Text_1($$anchor, $$props) {
	$.push($$props, true);

	function filterRows({ value }) {
		$$props.action({ value, key: $$props.column.id });
	}

	Text($$anchor, $.spread_props(() => $$props.filter.config ?? {}, {
		get value() {
			return $$props.filterValue;
		},
		onchange: filterRows
	}));

	$.pop();
}
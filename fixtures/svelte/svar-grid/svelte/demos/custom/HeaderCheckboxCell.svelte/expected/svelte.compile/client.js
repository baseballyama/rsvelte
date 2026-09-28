import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Checkbox } from "@svar-ui/svelte-core";

export default function HeaderCheckboxCell($$anchor, $$props) {
	$.push($$props, true);

	let value = $.state(false);

	$$props.api.getReactiveState().data.subscribe((data) => onCellCheck(data));

	function onCellCheck(data) {
		if (!data) ({ data } = $$props.api.getState());

		const checked = data.every((d) => d.checked === true);

		if ($.get(value) !== checked) {
			$$props.onaction && $$props.onaction({ action: "custom-header-check", data: { value: checked } });
			$.set(value, checked, true);
		}
	}

	function onChange(ev) {
		const { value } = ev;

		$$props.onaction && $$props.onaction({
			action: "custom-header-check",
			data: { value, eventSource: "click" }
		});
	}

	Checkbox($$anchor, {
		onchange: onChange,
		get value() {
			return $.get(value);
		},

		set value($$value) {
			$.set(value, $$value, true);
		}
	});

	$.pop();
}
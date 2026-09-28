import * as $ from 'svelte/internal/server';
import { Checkbox } from "@svar-ui/svelte-core";

export default function HeaderCheckboxCell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { api, onaction } = $$props;
		let value = false;

		api.getReactiveState().data.subscribe((data) => onCellCheck(data));

		function onCellCheck(data) {
			if (!data) ({ data } = api.getState());

			const checked = data.every((d) => d.checked === true);

			if (value !== checked) {
				onaction && onaction({ action: "custom-header-check", data: { value: checked } });
				value = checked;
			}
		}

		function onChange(ev) {
			const { value } = ev;

			onaction && onaction({
				action: "custom-header-check",
				data: { value, eventSource: "click" }
			});
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Checkbox($$renderer, {
				onchange: onChange,
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
					$$settled = false;
				}
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}
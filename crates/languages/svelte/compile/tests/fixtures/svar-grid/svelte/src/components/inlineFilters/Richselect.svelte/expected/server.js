import * as $ from 'svelte/internal/server';
import { getContext } from "svelte";
import { RichSelect } from "@svar-ui/svelte-core";
import { getValue } from "@svar-ui/grid-store";

export default function Richselect($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { filter, column, action, filterValue } = $$props;
		const api = getContext("grid-store");
		const { flatData: data } = api.getReactiveState();
		let options = $.derived(() => filter?.config?.options || column.options || getOptions($.store_get($$store_subs ??= {}, '$data', data)));
		let template = $.derived(() => filter?.config?.template);

		function getOptions() {
			const options = [];

			$.store_get($$store_subs ??= {}, '$data', data).forEach((d) => {
				const value = getValue(d, column);

				if (!options.includes(value)) options.push(value);
			});

			return options.map((opt) => ({ id: opt, label: opt }));
		}

		function filterRows({ value }) {
			action({ value, key: column.id });
		}

		function handleKeyDown(ev) {
			if (ev.key !== "Tab") ev.preventDefault();
		}

		$$renderer.push(`<div style="width:100%;">`);

		{
			function children($$renderer, option) {
				if (template()) {
					$$renderer.push(`<!--[0-->${$.escape(template()(option))}`);
				} else {
					$$renderer.push(`<!--[-1-->${$.escape(option.label)}`);
				}

				$$renderer.push(`<!--]-->`);
			}

			RichSelect($$renderer, $.spread_props([
				{ placeholder: "", clear: true },
				filter.config ?? {},
				{
					options: options(),
					value: filterValue,
					onchange: filterRows,
					children,
					$$slots: { default: true }
				}
			]));
		}

		$$renderer.push(`<!----></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}
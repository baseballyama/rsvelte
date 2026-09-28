import * as $ from 'svelte/internal/server';
import { getContext } from "svelte";
import { locale } from "@svar-ui/lib-dom";
import { en } from "@svar-ui/grid-locales";
import MultiSelect from "../MultiSelect.svelte";

export default function MultiSelect_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { filter, column, action, filterValue } = $$props;
		const _ = getContext("wx-i18n")?.getGroup("grid") || locale(en).getGroup("grid");

		const config = $.derived(() => {
			const obj = filter?.config || {};

			return { clear: true, ...obj };
		});

		let options = $.derived(() => config().options || column.options);

		const text = $.derived(() => {
			const len = filterValue?.length;

			if (!len) return "";
			if (len < 3) return filterValue.map((v) => column.optionsMap.get(v)).join(", ");

			return len + " " + _("selected");
		});

		function filterRows({ value }) {
			action({ value, key: column.id });
		}

		function handleKeyDown(ev) {
			if (ev.key !== "Tab") ev.preventDefault();
		}

		$$renderer.push(`<div style="width:100%;">`);

		MultiSelect($$renderer, $.spread_props([
			{ placeholder: "" },
			config(),
			{
				options: options(),
				value: filterValue || [],
				text: text(),
				onchange: filterRows
			}
		]));

		$$renderer.push(`<!----></div>`);
	});
}
import * as $ from 'svelte/internal/server';
import { getContext } from "svelte";
import { getDuodecade, delegateClick } from "@svar-ui/lib-dom";
import Button from "./Button.svelte";
import { getPartValue } from "./helpers";

export default function Duodecade($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const _ = getContext("wx-i18n").getRaw().calendar;

		let {
			value = void 0,
			current = void 0,
			oncancel,
			onchange,
			onshift,
			part
		} = $$props;

		const year = $.derived(() => current.getFullYear());

		const years = $.derived(() => {
			const { start, end } = getDuodecade(year());
			const years = [];

			for (let y = start; y <= end; ++y) {
				years.push(y);
			}

			return years;
		});

		const selectYears = { click: selectYear };

		function selectYear(year, e) {
			if (year) {
				e.stopPropagation();
				current.setFullYear(year);
				current = new Date(current);
				onshift && onshift({});
			}

			if (part === "normal") value = new Date(current);

			oncancel && oncancel();
		}

		function done() {
			const date = new Date(getPartValue(value, part) || current);

			date.setFullYear(current.getFullYear());
			onchange && onchange(date);
		}

		$$renderer.push(`<div class="wx-years svelte-1qvxscp"><!--[-->`);

		const each_array = $.ensure_array_like(years());

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let y = each_array[i];

			$$renderer.push(`<div${$.attr_class('wx-year svelte-1qvxscp', void 0, {
				'wx-current': year() == y,
				'wx-prev-decade': i === 0,
				'wx-next-decade': i === 11
			})}${$.attr('data-id', y)}>${$.escape(y)}</div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="wx-buttons svelte-1qvxscp">`);

		Button($$renderer, {
			onclick: done,
			children: ($$renderer) => {
				$$renderer.push(`<!---->${$.escape(_.done)}`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { value, current });
	});
}
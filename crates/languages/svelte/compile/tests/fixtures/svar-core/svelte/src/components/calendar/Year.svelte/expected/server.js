import * as $ from 'svelte/internal/server';
import { getContext } from "svelte";
import { delegateClick } from "@svar-ui/lib-dom";
import Button from "./Button.svelte";
import { getPartValue } from "./helpers";

export default function Year($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value = void 0,
			current = void 0,
			part,
			oncancel,
			onchange,
			onshift
		} = $$props;

		const locale = getContext("wx-i18n").getRaw().calendar;
		const months = locale.monthShort;
		const monthNum = $.derived(() => current.getMonth());
		const selectMonths = { click: selectMonth };

		function selectMonth(month, e) {
			if (month || month === 0) {
				e.stopPropagation();
				current.setMonth(month);
				current = new Date(current);
				onshift && onshift({});
			}

			if (part === "normal") value = new Date(current);

			oncancel && oncancel();
		}

		function done() {
			const date = new Date(getPartValue(value, part) || current);

			date.setMonth(current.getMonth());
			date.setFullYear(current.getFullYear());
			onchange && onchange(date);
		}

		$$renderer.push(`<div class="wx-months svelte-1nbu5oq"><!--[-->`);

		const each_array = $.ensure_array_like(months);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let month = each_array[i];

			$$renderer.push(`<div${$.attr_class('wx-month svelte-1nbu5oq', void 0, { 'wx-current': monthNum() === i })}${$.attr('data-id', i)}>${$.escape(month)}</div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="wx-buttons svelte-1nbu5oq">`);

		Button($$renderer, {
			onclick: done,
			children: ($$renderer) => {
				$$renderer.push(`<!---->${$.escape(locale.done)}`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { value, current });
	});
}
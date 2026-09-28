import * as $ from 'svelte/internal/server';
import { dateToString, getDuodecade } from "@svar-ui/lib-dom";
import { getContext } from "svelte";

export default function Header($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { calendar, formats } = getContext("wx-i18n").getRaw();
		let { date, type, part, onshift } = $$props;
		const year = $.derived(() => date.getFullYear());

		const label = $.derived(() => {
			switch (type) {
				case "month":
					return dateToString(formats.monthYearFormat, calendar)(date);

				case "year":
					return dateToString(formats.yearFormat, calendar)(date);

				case "duodecade":
					{
						const { start, end } = getDuodecade(year());
						const yearFormat = dateToString(formats.yearFormat, calendar);

						return `${yearFormat(new Date(start, 0, 1))} - ${yearFormat(new Date(end, 11, 31))}`;
					}
			}
		});

		function changeType() {
			onshift && onshift({ diff: 0, type });
		}

		$$renderer.push(`<div class="wx-header svelte-e82y9a">`);

		if (part != "right") {
			$$renderer.push(`<!--[0--><i class="wx-pager wxi-angle-left svelte-e82y9a"></i>`);
		} else {
			$$renderer.push(`<!--[-1--><span class="wx-spacer svelte-e82y9a"></span>`);
		}

		$$renderer.push(`<!--]-->  <span class="wx-label svelte-e82y9a">${$.escape(label())}</span> `);

		if (part != "left") {
			$$renderer.push(`<!--[0--><i class="wx-pager wxi-angle-right svelte-e82y9a"></i>`);
		} else {
			$$renderer.push(`<!--[-1--><span class="wx-spacer svelte-e82y9a"></span>`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}
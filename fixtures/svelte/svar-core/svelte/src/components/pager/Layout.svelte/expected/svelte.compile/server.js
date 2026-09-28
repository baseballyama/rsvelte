import * as $ from 'svelte/internal/server';
import { getContext } from "svelte";

export default function Layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { total = 0, pageSize = 20, value = 1, onchange } = $$props;
		const _ = getContext("wx-i18n").getGroup("core");
		const pageCount = $.derived(() => Math.ceil(total / pageSize));
		const from = $.derived(() => (value - 1) * pageSize);
		const to = $.derived(() => Math.min(value * pageSize, total));

		const setValue = (v) => {
			value = v;

			setTimeout(() => {
				onchange && onchange({ value, from: from(), to: to() });
			});
		};

		function setActivePage(id) {
			switch (id) {
				case "first":
					setValue(1);
					break;

				case "prev":
					setValue(value - 1);
					break;

				case "next":
					setValue(value + 1);
					break;

				case "last":
					setValue(pageCount());
					break;
			}
		}

		const oninput = (e) => {
			const newValue = +e.target.value;

			if (Number.isNaN(newValue) || newValue < 1 || newValue > pageCount()) {
				return;
			}

			setValue(newValue);
		};

		const onPageSizeInput = (e) => {
			onchange && onchange({ value: +e.target.value, from: from(), to: to() });
		};

		$$renderer.push(`<div class="wx-pager svelte-htuz56"><div class="wx-left svelte-htuz56"><span>${$.escape(_("Rows per page"))}:</span> <input type="number"${$.attr('value', pageSize)} min="1" class="svelte-htuz56"/></div> <div class="wx-center svelte-htuz56"><i${$.attr_class('wx-icon wxi-angle-dbl-left svelte-htuz56', void 0, { 'wx-disabled': value === 1 })}></i>  <i${$.attr_class('wx-icon wxi-angle-left svelte-htuz56', void 0, { 'wx-disabled': value === 1 })}></i> <input type="text"${$.attr('value', value)} class="svelte-htuz56"/>  <i${$.attr_class('wx-icon wxi-angle-right svelte-htuz56', void 0, { 'wx-disabled': value === pageCount() })}></i>  <i${$.attr_class('wx-icon wxi-angle-dbl-right svelte-htuz56', void 0, { 'wx-disabled': value === pageCount() })}></i></div> <div class="wx-right svelte-htuz56">${$.escape(_("Total pages"))}: ${$.escape(pageCount())}</div></div>`);
		$.bind_props($$props, { pageSize, value });
	});
}
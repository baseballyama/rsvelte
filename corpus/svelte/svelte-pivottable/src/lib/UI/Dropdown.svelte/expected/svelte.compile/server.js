import * as $ from 'svelte/internal/server';
import { clickOutside } from "./utils";

export default function Dropdown($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { current = void 0, values = [], onchange = undefined } = $$props;
		let open = false;
		const toggle = () => open = !open;

		$$renderer.push(`<div class="pvtDropdown"><button${$.attr_class("pvtDropdownValue pvtDropdownCurrent " + (open ? "pvtDropdownCurrentOpen" : ""))}><div class="pvtDropdownIcon">${$.escape(open ? "×" : "▾")}</div> `);

		if (current) {
			$$renderer.push(`<!--[0-->${$.escape(current)}`);
		} else {
			$$renderer.push(`<!--[-1--><span> </span>`);
		}

		$$renderer.push(`<!--]--></button> `);

		if (open) {
			$$renderer.push(`<!--[0--><div class="pvtDropdownMenu" style="z-index: 100;"><!--[-->`);

			const each_array = $.ensure_array_like(values);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let r = each_array[$$index];

				$$renderer.push(`<div role="button"${$.attr_class('pvtDropdownValue', void 0, { 'pvtDropdownActiveValue': r === current })} tabindex="0">${$.escape(r)}</div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { current });
	});
}
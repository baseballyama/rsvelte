import * as $ from 'svelte/internal/server';
import { Slider, Combo, Button, TimePicker, Pager, Avatar } from "@svar-ui/svelte-core";
import { getData } from "../data";

export default function Topbar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { employees, countries } = getData();

		$$renderer.push(`<div class="topbar svelte-1j3ty4w">`);
		Slider($$renderer, { value: 78 });
		$$renderer.push(`<!----> <div class="block svelte-1j3ty4w"><div class="combo" style="width: 160px">`);

		{
			function children($$renderer, { option }) {
				$$renderer.push(`<!---->${$.escape(option.name)}`);
			}

			Combo($$renderer, {
				options: countries,
				textField: 'name',
				placeholder: 'Click to select',
				children,
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!----></div> <div class="avatars svelte-1j3ty4w" style="width: 134px">`);
		Avatar($$renderer, { value: employees, limit: 7, size: 28 });
		$$renderer.push(`<!----></div> <div class="button svelte-1j3ty4w" style="width: 131px">`);

		Button($$renderer, {
			type: "primary",
			icon: "wxi-cat",
			children: ($$renderer) => {
				$$renderer.push(`<!---->Button`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="timepicker" style="width: 148px">`);
		TimePicker($$renderer, { value: new Date(0, 0, 0, 14, 0, 0) });
		$$renderer.push(`<!----></div> <div class="pager svelte-1j3ty4w" style="width: 308px">`);
		Pager($$renderer, { value: 2, total: 100 });
		$$renderer.push(`<!----></div></div></div>`);
	});
}
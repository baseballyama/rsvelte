import * as $ from 'svelte/internal/server';
import { Switch } from "@svar-ui/svelte-core";

export default function CustomThemeSelect($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value = void 0 } = $$props;

		const skins = [
			{
				id: "willow",
				css: "wx-willow-theme",
				name: "Willow",
				color: "#37a9ef",
				color2: "#fff"
			},

			{
				id: "willow-dark",
				css: "wx-willow-dark-theme",
				name: "Dark",
				color: "#7a67eb",
				color2: "#384047"
			}
		];

		const swithValue = () => {
			const ind = (skins.findIndex((a) => a.id === value) + 1) % skins.length;

			value = skins[ind].id;
		};

		$$renderer.push(`<div${$.attr_class('custom svelte-nvqmc8', void 0, { 'dark': value === "willow-dark" })} style="width: 170px">`);
		Switch($$renderer, { value: value === "willow-dark", onchange: swithValue });
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { value });
	});
}
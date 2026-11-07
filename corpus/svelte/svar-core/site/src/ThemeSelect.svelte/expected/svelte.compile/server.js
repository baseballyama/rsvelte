import * as $ from 'svelte/internal/server';
import { RichSelect } from "@svar-ui/svelte-core";

export default function ThemeSelect($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value = "willow" } = $$props;

		const skins = [
			{
				id: "willow",
				css: "wx-willow-theme",
				label: "Willow",
				color: "#37a9ef",
				color2: "#fff"
			},

			{
				id: "willow-dark",
				css: "wx-willow-dark-theme",
				label: "Dark",
				color: "#7a67eb",
				color2: "#384047"
			}
		];

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div style="width: 170px">`);

			{
				function children($$renderer, option) {
					$$renderer.push(`<div style="display:flex;gap:8px"><div class="round"${$.attr_style(`border: 2px solid ${$.stringify(option.color)}`)}><div class="color"${$.attr_style(`background:${$.stringify(option.color)}`)}></div> <div class="color"${$.attr_style(`background:${$.stringify(option.color2)}`)}></div></div> <span>${$.escape(option.label)}</span></div> `);

					$$renderer.push(`<style>
				.round {
					width: 20px;
					height: 20px;
					border-radius: 50%;
					display: flex;
				}
				.color {
					width: 50%;
					height: 100%;
				}
				.color:first-child {
					border-radius: 12px 0 0 12px;
				}
				.color:last-child {
					border-radius: 0 12px 12px 0;
				}
			</style>`);
				}

				RichSelect($$renderer, {
					options: skins,
					get value() {
						return value;
					},

					set value($$value) {
						value = $$value;
						$$settled = false;
					},
					children,
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!----></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { value });
	});
}
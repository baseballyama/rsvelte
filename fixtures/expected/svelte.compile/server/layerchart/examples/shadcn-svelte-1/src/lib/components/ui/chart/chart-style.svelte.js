import * as $ from 'svelte/internal/server';
import { THEMES } from "./chart-utils.js";

export default function Chart_style($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { id, config } = $$props;

		const colorConfig = $.derived(() => config
			? Object.entries(config).filter(([, config]) => config.theme || config.color)
			: null);

		const themeContents = $.derived(() => {
			if (!colorConfig() || !colorConfig().length) return;

			const themeContents = [];

			for (let [_theme, prefix] of Object.entries(THEMES)) {
				let content = `${prefix} [data-chart=${id}] {\n`;

				const color = colorConfig().map(([key, itemConfig]) => {
					const theme = _theme;
					const color = itemConfig.theme?.[theme] || itemConfig.color;

					return color ? `\t--color-${key}: ${color};` : null;
				});

				content += color.join("\n") + "\n}";
				themeContents.push(content);
			}

			return themeContents.join("\n");
		});

		if (themeContents()) {
			$$renderer.push(`<!--[0--><!---->`);

			{
				$.element($$renderer, "style", void 0, () => {
					$$renderer.push(`${$.escape(themeContents())}`);
				});
			}

			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}
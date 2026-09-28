import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { THEMES } from './chart-utils.js';

export default function Chart_style($$anchor, $$props) {
	$.push($$props, true);

	const colorConfig = $.derived(() => $$props.config
		? Object.entries($$props.config).filter(([, config]) => config.theme || config.color)
		: null);

	const themeContents = $.derived(() => {
		if (!$.get(colorConfig) || !$.get(colorConfig).length) return;

		const themeContents = [];

		for (const [_theme, prefix] of Object.entries(THEMES)) {
			let content = `${prefix} [data-chart=${$$props.id}] {\n`;

			const color = $.get(colorConfig).map(([key, itemConfig]) => {
				const theme = _theme;
				const color = itemConfig.theme?.[theme] || itemConfig.color;

				return color ? `\t--color-${key}: ${color};` : null;
			});

			content += color.join('\n') + '\n}';
			themeContents.push(content);
		}

		return themeContents.join('\n');
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.key(node_1, () => $$props.id, ($$anchor) => {
				var fragment_2 = $.comment();
				var node_2 = $.first_child(fragment_2);

				$.element(node_2, () => 'style', false, ($$element, $$anchor) => {
					var text = $.text();

					$.template_effect(() => $.set_text(text, $.get(themeContents)));
					$.append($$anchor, text);
				});

				$.append($$anchor, fragment_2);
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(themeContents)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}
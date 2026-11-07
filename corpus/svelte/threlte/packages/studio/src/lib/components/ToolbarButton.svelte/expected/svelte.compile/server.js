import * as $ from 'svelte/internal/server';
import IconButton from './IconButton.svelte';
import Tooltip from './Tooltip.svelte';

export default function ToolbarButton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			icon,
			label,
			active = false,
			warn = false,
			success = false,
			error = false,
			disabled = false,
			tooltip: tooltipProp = '',
			onclick
		} = $$props;

		function button($$renderer) {
			IconButton($$renderer, { onclick, disabled, active, warn, success, icon, label, error });
		}

		if (tooltipProp.length) {
			$$renderer.push('<!--[0-->');

			{
				function tooltip($$renderer) {
					$$renderer.push(`<span>${$.escape(tooltipProp)}</span>`);
				}

				Tooltip($$renderer, {
					tooltip,
					children: ($$renderer) => {
						button($$renderer);
					},
					$$slots: { tooltip: true, default: true }
				});
			}
		} else {
			$$renderer.push('<!--[-1-->');
			button($$renderer);
		}

		$$renderer.push(`<!--]-->`);
	});
}
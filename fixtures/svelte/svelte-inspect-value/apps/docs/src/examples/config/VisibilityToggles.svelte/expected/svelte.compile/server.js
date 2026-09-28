import * as $ from 'svelte/internal/server';
import Inspect from 'svelte-inspect-value';
import values from './values';
import { globalOpts } from '@components/global-opts/globalopts.svelte';

export default function VisibilityToggles($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let props = {
			showLength: true,
			showPreview: true,
			showTools: true,
			showTypes: true
		};

		Inspect($$renderer, $.spread_props([
			props,
			{
				class: 'not-content mt',
				theme: globalOpts.theme,
				borderless: globalOpts.borderless,
				values,
				expandLevel: 0
			}
		]));

		$$renderer.push(`<!----> <div class="input-row"><label>Lengths <input type="checkbox"${$.attr('checked', props.showLength, true)}/></label> <label>Types <input type="checkbox"${$.attr('checked', props.showTypes, true)}/></label> <label>Tools <input type="checkbox"${$.attr('checked', props.showTools, true)}/></label> <label>Preview <input type="checkbox"${$.attr('checked', props.showPreview, true)}/></label></div>`);
	});
}
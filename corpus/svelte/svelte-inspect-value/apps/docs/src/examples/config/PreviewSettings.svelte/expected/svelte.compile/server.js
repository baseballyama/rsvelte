import * as $ from 'svelte/internal/server';
import Inspect from 'svelte-inspect-value';
import values from './values';
import { globalOpts } from '@components/global-opts/globalopts.svelte';

export default function PreviewSettings($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let props = { previewDepth: 1, previewEntries: 3 };

		Inspect($$renderer, $.spread_props([
			props,
			{
				class: 'not-content mt',
				theme: globalOpts.theme,
				borderless: globalOpts.borderless,
				values,
				showPreview: true,
				expandLevel: 0
			}
		]));

		$$renderer.push(`<!----> <div class="input-row"><label>Depth <input type="number"${$.attr('value', props.previewDepth)} class="svelte-zc9h5c"/></label> <label>Entries <input type="number"${$.attr('value', props.previewEntries)} class="svelte-zc9h5c"/></label></div>`);
	});
}
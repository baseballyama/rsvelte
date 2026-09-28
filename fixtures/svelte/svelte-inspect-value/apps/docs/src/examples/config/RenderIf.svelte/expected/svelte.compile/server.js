import * as $ from 'svelte/internal/server';
import Inspect from 'svelte-inspect-value';
import values from './values';
import { globalOpts } from '@components/global-opts/globalopts.svelte';

export default function RenderIf($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let shouldRender = true;
		let renderIf = () => shouldRender;

		$$renderer.push(`<div class="cnt svelte-3txg68">`);

		Inspect($$renderer, {
			renderIf,
			class: 'not-content mt',
			theme: globalOpts.theme,
			borderless: globalOpts.borderless,
			values,
			expandLevel: 0
		});

		$$renderer.push(`<!----></div> <div class="input-row"><label>Should Render <input type="checkbox"${$.attr('checked', shouldRender, true)}/></label></div>`);
	});
}
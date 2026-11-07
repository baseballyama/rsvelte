import * as $ from 'svelte/internal/server';
import Inspect from 'svelte-inspect-value';
import values from './values';
import { globalOpts } from '@components/global-opts/globalopts.svelte';

export default function ExpandLevel($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let expandLevel = 0;
		let expandPaths = [];
		let display = 0;
		let props = $.derived(() => ({ expandLevel, expandPaths }));

		$$renderer.push(`<div class="input-row"><label>expandLevel <input${$.attr('min', 0)}${$.attr('max', 30)} type="number"${$.attr('value', expandLevel)} class="svelte-1eay6v5"/></label> <label>Set expandPaths <input type="checkbox"${$.attr('checked', Boolean(expandPaths.length), true)} class="svelte-1eay6v5"/></label></div> <!---->`);

		{
			Inspect($$renderer, $.spread_props([
				props(),
				{
					class: 'not-content mt',
					theme: globalOpts.theme,
					borderless: globalOpts.borderless,
					values: {
						arr: values.veryNested,
						levelOne: {
							a: 'a',
							b: 'b',
							levelTwo: {
								a: 'a',
								b: 'b',
								levelThree: { a: 'a', b: 'b', levelFour: { msg: 'end' } }
							}
						},
						expandPathsValue: expandPaths
					},
					showPreview: true
				}
			]));
		}

		$$renderer.push(`<!---->`);
	});
}
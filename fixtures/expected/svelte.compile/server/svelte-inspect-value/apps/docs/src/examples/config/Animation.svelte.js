import * as $ from 'svelte/internal/server';
import Inspect from 'svelte-inspect-value';
import values from './values';
import { globalOpts } from '@components/global-opts/globalopts.svelte';

export default function Animation($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let props = { noanimate: false, animRate: 1, flashOnUpdate: true };
		let num = 0;

		Inspect($$renderer, $.spread_props([
			{ heading: true },
			props,
			{
				class: 'not-content mt',
				theme: globalOpts.theme,
				borderless: globalOpts.borderless,
				values: {
					...values,
					updates: num,
					duration: (250 / props.animRate).toFixed(2) + 'ms'
				},
				expandLevel: 0
			}
		]));

		$$renderer.push(`<!----> <div class="input-row"><label>No Animation <input type="checkbox"${$.attr('checked', props.noanimate, true)}/></label> <label>Animation Rate <input${$.attr('min', 0.25)}${$.attr('step', 0.25)} type="number"${$.attr('value', props.animRate)}/></label> <label>Flash On Update <input type="checkbox"${$.attr('checked', props.flashOnUpdate, true)}/></label></div>`);
	});
}
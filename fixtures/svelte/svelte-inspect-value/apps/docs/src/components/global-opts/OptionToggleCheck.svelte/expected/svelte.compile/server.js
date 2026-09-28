import * as $ from 'svelte/internal/server';
import { globalOpts } from './globalopts.svelte';

export default function OptionToggleCheck($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, key, disabled, $$slots, $$events, ...rest } = $$props;
		let checked = $.derived(() => Boolean(globalOpts[key]));

		function onchange(event) {
			globalOpts[key] = event.currentTarget.checked;
		}

		$$renderer.push(`<label${$.attributes({ ...rest }, 'svelte-1vvibjn')}>`);
		children?.($$renderer);
		$$renderer.push(`<!----> <input class="opt-tgl-chk svelte-1vvibjn"${$.attr('id', key)}${$.attr('name', key)}${$.attr('disabled', disabled, true)} type="checkbox"${$.attr('checked', checked(), true)}/></label>`);
	});
}
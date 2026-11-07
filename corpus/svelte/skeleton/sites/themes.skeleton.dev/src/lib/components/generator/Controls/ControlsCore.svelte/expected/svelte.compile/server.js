import * as $ from 'svelte/internal/server';
import { settingsCore } from '$lib/state/generator.svelte';

export default function ControlsCore($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="p-5"><div class="field-group grid-cols-[auto_1fr]"><label class="label label-text preset-tonal" for="theme-name">Name</label> <input class="input" type="text" id="theme-name" placeholder="Enter theme name..."${$.attr('value', settingsCore.name)}/></div></div>`);
	});
}
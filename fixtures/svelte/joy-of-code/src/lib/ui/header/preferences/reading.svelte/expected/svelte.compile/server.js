import * as $ from 'svelte/internal/server';
import { preferences } from './preferences.svelte';

export default function Reading($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="reading-size"><label for="text-size"><span>Reading size</span></label> <div class="slider svelte-7mfisf"><span>${$.escape(preferences.textSize)}px</span> <input${$.attr('value', preferences.textSize)} type="range" name="text-size" id="text-size" min="16" max="24" step="2" class="svelte-7mfisf"/></div></div> <div class="reading-length"><label for="text-length"><span>Reading length</span></label> <div class="slider svelte-7mfisf"><span>${$.escape(preferences.textLength)}ch</span> <input${$.attr('value', preferences.textLength)} type="range" name="text-length" id="text-length" min="60" max="100" step="10" class="svelte-7mfisf"/></div></div> <div class="reading-height"><label for="text-height"><span>Reading line height</span></label> <div class="slider svelte-7mfisf"><span>${$.escape(preferences.textHeight)}px</span> <input${$.attr('value', preferences.textHeight)} type="range" name="text-height" id="text-height" min="32" max="48" step="8" class="svelte-7mfisf"/></div></div>`);
	});
}
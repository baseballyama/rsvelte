import * as $ from 'svelte/internal/server';
import { preferences } from './preferences.svelte';

export default function Reset($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="reset-preferences"><span>Use default settings</span> <button class="svelte-1knw26i">Reset</button></div>`);
	});
}
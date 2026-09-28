import * as $ from 'svelte/internal/server';
import { settings } from './main.svelte';

export default function Child($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<!---->Child: ${$.escape(settings.showInRgb)}`);
	});
}
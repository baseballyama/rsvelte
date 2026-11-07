import * as $ from 'svelte/internal/server';
import Child from './Child.svelte';

const context = { settings: { showInRgb: true } };

export const settings = context.settings;

export default function Main($$renderer) {
	$$renderer.push(`<button>click ${$.escape(settings.showInRgb)}</button> `);
	Child($$renderer, {});
	$$renderer.push(`<!---->`);
}
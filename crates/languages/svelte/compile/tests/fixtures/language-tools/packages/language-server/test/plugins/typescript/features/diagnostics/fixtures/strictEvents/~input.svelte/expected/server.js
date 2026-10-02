import * as $ from 'svelte/internal/server';
import StrictEvents from './strictEvents.svelte';

export default function Input($$renderer) {
	StrictEvents($$renderer, {});
	$$renderer.push(`<!----> `);
	StrictEvents($$renderer, {});
	$$renderer.push(`<!---->`);
}
import * as $ from 'svelte/internal/server';
import CEI from './component-events-interface.svelte';
import CED from './component-events-event-dispatcher.svelte';

export default function Component_events_completion($$renderer) {
	CEI($$renderer, { foo: '' });
	$$renderer.push(`<!----> `);
	CED($$renderer, { on: true });
	$$renderer.push(`<!---->`);
}
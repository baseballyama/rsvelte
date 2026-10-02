import * as $ from 'svelte/internal/server';
import { ComponentDef, ComponentDef2 } from './ComponentDef';

export default function Component_events_completion_ts_def($$renderer) {
	ComponentDef($$renderer, { on: true });
	$$renderer.push(`<!----> `);
	ComponentDef($$renderer, { let: true });
	$$renderer.push(`<!----> `);
	ComponentDef2($$renderer, { on: true });
	$$renderer.push(`<!---->`);
}
import * as $ from 'svelte/internal/server';
import { Container } from '$lib/layout';
import DangerZone from './dangerZone.svelte';
import UpdateEvents from './updateEvents.svelte';
import UpdateName from './updateName.svelte';
import UpdateSecurity from './updateSecurity.svelte';
import UpdateSignature from './updateSignature.svelte';
import UpdateUrl from './updateURL.svelte';
import Details from './details.svelte';

export default function _page($$renderer) {
	Container($$renderer, {
		children: ($$renderer) => {
			Details($$renderer, {});
			$$renderer.push(`<!----> `);
			UpdateSignature($$renderer, {});
			$$renderer.push(`<!----> `);
			UpdateName($$renderer, {});
			$$renderer.push(`<!----> `);
			UpdateUrl($$renderer, {});
			$$renderer.push(`<!----> `);
			UpdateEvents($$renderer, {});
			$$renderer.push(`<!----> `);
			UpdateSecurity($$renderer, {});
			$$renderer.push(`<!----> `);
			DangerZone($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}
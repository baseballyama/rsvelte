import * as $ from 'svelte/internal/server';
import { Container } from '$lib/layout';
import DangerZone from './dangerZone.svelte';
import Details from './details.svelte';
import UpdateName from './updateName.svelte';
import UpdatePermissions from './updatePermissions.svelte';

export default function _page($$renderer) {
	Container($$renderer, {
		children: ($$renderer) => {
			Details($$renderer, {});
			$$renderer.push(`<!----> `);
			UpdateName($$renderer, {});
			$$renderer.push(`<!----> `);
			UpdatePermissions($$renderer, {});
			$$renderer.push(`<!----> `);
			DangerZone($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}
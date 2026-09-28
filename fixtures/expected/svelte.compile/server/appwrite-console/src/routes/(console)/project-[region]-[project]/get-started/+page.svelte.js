import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import Onboard from '../overview/onboard.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$.head('eerlor', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Console - Appwrite</title>`);
			});
		});

		Onboard($$renderer, {
			platforms: page.data.platforms.platforms,
			pingCount: page.data.project.pingCount
		});
	});
}
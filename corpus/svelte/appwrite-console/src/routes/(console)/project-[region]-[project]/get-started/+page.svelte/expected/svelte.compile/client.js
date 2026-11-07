import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import Onboard from '../overview/onboard.svelte';

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	$.head('eerlor', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Console - Appwrite';
		});
	});

	Onboard($$anchor, {
		get platforms() {
			return page.data.platforms.platforms;
		},

		get pingCount() {
			return page.data.project.pingCount;
		}
	});

	$.pop();
}
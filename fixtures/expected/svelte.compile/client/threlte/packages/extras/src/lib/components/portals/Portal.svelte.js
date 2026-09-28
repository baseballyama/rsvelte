import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { usePortalContext } from './usePortalContext.svelte.js';
import { SvelteSet } from 'svelte/reactivity';

export default function Portal($$anchor, $$props) {
	$.push($$props, true);

	let id = $.prop($$props, 'id', 3, 'default');

	// @Todo Remove in Threlte 9
	$.user_pre_effect(() => {
		if ($$props.object) {
			console.error('<Portal>: "object" prop has been removed. Use "attach" instead.');
		}
	});

	const portals = usePortalContext();

	$.user_pre_effect(() => {
		if (!$$props.children) return;

		const currentId = id();

		if (!portals.has(currentId)) {
			portals.set(currentId, new SvelteSet());
		}

		portals.get(currentId)?.add($$props.children);

		return () => {
			portals.get(currentId)?.delete($$props.children);
		};
	});

	$.pop();
}
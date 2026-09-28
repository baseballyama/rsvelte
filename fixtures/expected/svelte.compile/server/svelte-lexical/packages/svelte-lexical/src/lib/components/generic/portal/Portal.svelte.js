import * as $ from 'svelte/internal/server';
import { onMount, onDestroy } from 'svelte';

export default function Portal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			target = globalThis.document?.body,
			children,
			portalRef = void 0
		} = $$props;

		onMount(() => {
			if (target) {
				target.appendChild(portalRef);
			}
		});

		onDestroy(() => {
			if (portalRef?.parentNode) {
				portalRef.parentNode?.removeChild(portalRef);
			}
		});

		$$renderer.push(`<div>`);
		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { portalRef });
	});
}
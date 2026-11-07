import * as $ from 'svelte/internal/server';
import { ModeWatcher } from "mode-watcher";
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import { DesignSystemProvider } from "$lib/features/design-system/index.js";

export default function _layout($$renderer, $$props) {
	let { children } = $$props;

	ModeWatcher($$renderer, {});
	$$renderer.push(`<!----> `);

	if (Tooltip.Provider) {
		$$renderer.push('<!--[-->');

		Tooltip.Provider($$renderer, {
			children: ($$renderer) => {
				DesignSystemProvider($$renderer, {
					children: ($$renderer) => {
						children($$renderer);
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}
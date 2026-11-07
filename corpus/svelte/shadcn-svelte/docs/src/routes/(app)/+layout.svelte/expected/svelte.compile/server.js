import * as $ from 'svelte/internal/server';
import { ModeWatcher } from "mode-watcher";
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import { DesignSystemProvider } from "$lib/features/design-system/index.js";
import { Toaster } from "$lib/registry/ui/sonner/index.js";
import { UserConfig, UserConfigContext } from "$lib/user-config.svelte.js";

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, data } = $$props;

		// svelte-ignore state_referenced_locally
		UserConfigContext.set(new UserConfig(data.userConfig));

		ModeWatcher($$renderer, { defaultMode: 'system', disableTransitions: true });
		$$renderer.push(`<!----> `);

		if (Tooltip.Provider) {
			$$renderer.push('<!--[-->');

			Tooltip.Provider($$renderer, {
				children: ($$renderer) => {
					DesignSystemProvider($$renderer, {
						children: ($$renderer) => {
							Toaster($$renderer, { position: 'top-center' });
							$$renderer.push(`<!----> `);
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
	});
}
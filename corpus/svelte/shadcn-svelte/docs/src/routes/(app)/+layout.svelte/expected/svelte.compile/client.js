import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ModeWatcher } from "mode-watcher";
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import { DesignSystemProvider } from "$lib/features/design-system/index.js";
import { Toaster } from "$lib/registry/ui/sonner/index.js";
import { UserConfig, UserConfigContext } from "$lib/user-config.svelte.js";

var root = $.from_html(`<!> <!>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	// svelte-ignore state_referenced_locally
	UserConfigContext.set(new UserConfig($$props.data.userConfig));

	var fragment = root();
	var node = $.first_child(fragment);

	ModeWatcher(node, { defaultMode: 'system', disableTransitions: true });

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => Tooltip.Provider, ($$anchor, Tooltip_Provider) => {
		Tooltip_Provider($$anchor, {
			children: ($$anchor, $$slotProps) => {
				DesignSystemProvider($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_2 = $.first_child(fragment_2);

						Toaster(node_2, { position: 'top-center' });

						var node_3 = $.sibling(node_2, 2);

						$.snippet(node_3, () => $$props.children);
						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}
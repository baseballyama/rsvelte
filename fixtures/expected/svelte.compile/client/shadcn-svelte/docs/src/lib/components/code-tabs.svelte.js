import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Tabs from "$lib/registry/ui/tabs/index.js";
import { UserConfigContext } from "$lib/user-config.svelte.js";

export default function Code_tabs($$anchor, $$props) {
	$.push($$props, true);

	const userConfig = UserConfigContext.get();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Tabs.Root, ($$anchor, Tabs_Root) => {
		Tabs_Root($$anchor, {
			get value() {
				return userConfig.current.installationType;
			},
			onValueChange: (v) => userConfig.setConfig({ installationType: v }),
			class: 'relative mt-6 w-full',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.snippet(node_1, () => $$props.children ?? $.noop);
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}
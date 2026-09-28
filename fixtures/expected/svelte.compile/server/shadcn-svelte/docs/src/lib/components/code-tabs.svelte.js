import * as $ from 'svelte/internal/server';
import * as Tabs from "$lib/registry/ui/tabs/index.js";
import { UserConfigContext } from "$lib/user-config.svelte.js";

export default function Code_tabs($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;
		const userConfig = UserConfigContext.get();

		if (Tabs.Root) {
			$$renderer.push('<!--[-->');

			Tabs.Root($$renderer, {
				value: userConfig.current.installationType,
				onValueChange: (v) => userConfig.setConfig({ installationType: v }),
				class: 'relative mt-6 w-full',
				children: ($$renderer) => {
					children?.($$renderer);
					$$renderer.push(`<!---->`);
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
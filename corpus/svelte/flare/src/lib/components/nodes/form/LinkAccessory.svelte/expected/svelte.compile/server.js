import * as $ from 'svelte/internal/server';
import { useTypedNode } from '$lib/node.svelte';
import { openUrl } from '@tauri-apps/plugin-opener';
import { Button } from '$lib/components/ui/button';

export default function LinkAccessory($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { nodeId, uiTree } = $$props;

		const $$d = $.derived(useTypedNode(() => ({ nodeId, uiTree, type: 'Form.LinkAccessory' }))),
			componentProps = $.derived(() => $$d().props);

		function handleClick() {
			if (componentProps()?.target) {
				openUrl(componentProps().target);
			}
		}

		if (componentProps()) {
			$$renderer.push('<!--[0-->');

			Button($$renderer, {
				variant: 'link',
				class: 'text-muted-foreground hover:text-foreground px-0 text-sm underline',
				onclick: handleClick,
				children: ($$renderer) => {
					$$renderer.push(`<!---->${$.escape(componentProps().text)}`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}
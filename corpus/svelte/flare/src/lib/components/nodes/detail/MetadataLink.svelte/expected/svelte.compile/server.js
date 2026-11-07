import * as $ from 'svelte/internal/server';
import { useTypedNode } from '$lib/node.svelte';
import { openUrl } from '@tauri-apps/plugin-opener';
import { Button } from '$lib/components/ui/button';
import Icon from '$lib/components/Icon.svelte';

export default function MetadataLink($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { nodeId, uiTree } = $$props;

		const $$d = $.derived(useTypedNode(() => ({
				nodeId,
				uiTree,
				type: ['Detail.Metadata.Link', 'List.Item.Detail.Metadata.Link']
			}))),
			componentProps = $.derived(() => $$d().props);

		if (componentProps()) {
			$$renderer.push(`<!--[0--><div><h3 class="text-muted-foreground mb-1 text-xs font-medium">${$.escape(componentProps().title)}</h3> `);

			Button($$renderer, {
				href: componentProps().target,
				onclick: (e) => {
					e.preventDefault();
					openUrl(componentProps().target);
				},
				class: 'group text-foreground flex h-auto justify-between !p-0',
				variant: 'link',
				children: ($$renderer) => {
					$$renderer.push(`<!---->${$.escape(componentProps().text)} `);

					Icon($$renderer, {
						icon: 'arrow-ne-16',
						class: 'text-muted-foreground group-hover:text-foreground size-4'
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}
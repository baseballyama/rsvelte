import * as $ from 'svelte/internal/server';
import { useTypedNode } from '$lib/node.svelte';
import Icon from '$lib/components/Icon.svelte';

export default function MetadataLabel($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { nodeId, uiTree } = $$props;

		const $$d = $.derived(useTypedNode(() => ({
				nodeId,
				uiTree,
				type: ['Detail.Metadata.Label', 'List.Item.Detail.Metadata.Label']
			}))),
			componentProps = $.derived(() => $$d().props);

		const textValue = $.derived(() => typeof componentProps()?.text === 'object' ? componentProps().text.value : componentProps()?.text);
		const textColor = $.derived(() => typeof componentProps()?.text === 'object' ? componentProps().text.color : undefined);

		if (componentProps()) {
			$$renderer.push(`<!--[0--><div><h3 class="text-muted-foreground mb-1 text-xs font-medium">${$.escape(componentProps().title)}</h3> <div class="flex items-center gap-2">`);

			if (componentProps().icon) {
				$$renderer.push('<!--[0-->');
				Icon($$renderer, { icon: componentProps().icon, class: 'size-4' });
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (textValue()) {
				$$renderer.push(`<!--[0--><span class="text-sm"${$.attr_style('', { color: textColor() })}>${$.escape(textValue())}</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}
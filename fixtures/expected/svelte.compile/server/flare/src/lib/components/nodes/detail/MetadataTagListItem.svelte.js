import * as $ from 'svelte/internal/server';
import { useTypedNode } from '$lib/node.svelte';
import { colorLikeToColor } from '$lib/props';
import Icon from '$lib/components/Icon.svelte';
import 'mode-watcher';
import { mode } from 'mode-watcher';

export default function MetadataTagListItem($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { nodeId, uiTree, onDispatch } = $$props;

		const $$d = $.derived(useTypedNode(() => ({
				nodeId,
				uiTree,
				type: [
					'Detail.Metadata.TagList.Item',
					'List.Item.Detail.Metadata.TagList.Item'
				]
			}))),
			componentProps = $.derived(() => $$d().props);

		function handleClick() {
			onDispatch(nodeId, 'onAction', []);
		}

		const color = $.derived(() => colorLikeToColor(componentProps()?.color ?? '', mode.current === 'dark'));

		if (componentProps()) {
			$$renderer.push(`<!--[0--><button type="button" class="inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-sm"${$.attr_style('', {
				color,
				'background-color': `color-mix(in srgb, ${$.stringify(color())} 15%, transparent)`
			})}>`);

			if (componentProps().icon) {
				$$renderer.push('<!--[0-->');
				Icon($$renderer, { icon: componentProps().icon, class: 'size-[18px]' });
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (componentProps().text) {
				$$renderer.push(`<!--[0--><span>${$.escape(componentProps().text)}</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></button>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}
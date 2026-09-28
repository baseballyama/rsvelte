import * as $ from 'svelte/internal/server';
import { useTypedNode } from '$lib/node.svelte';
import NodeRenderer from '$lib/components/NodeRenderer.svelte';
import SvelteMarked from 'svelte-marked';

export default function Detail($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { nodeId, uiTree, onDispatch, layout = 'horizontal' } = $$props;

		const $$d = $.derived(useTypedNode(() => ({ nodeId, uiTree, type: ['Detail', 'List.Item.Detail'] }))),
			node = $.derived(() => $$d().node),
			detailProps = $.derived(() => $$d().props);

		const metadataNodeId = $.derived(() => node()?.namedChildren?.['metadata']);

		if (node() && detailProps()) {
			$$renderer.push(`<!--[0--><div${$.attr_class('flex h-full', void 0, {
				'flex-row': layout === 'horizontal',
				'flex-col': layout === 'vertical'
			})}><main${$.attr_class('w-full overflow-y-auto', void 0, { 'p-6': layout === 'horizontal', 'p-4': layout === 'vertical' })}>`);

			if (detailProps().markdown) {
				$$renderer.push(`<!--[0--><article class="prose dark:prose-invert prose-img:mx-auto prose-img:max-w-full prose-sm max-w-full">`);
				SvelteMarked($$renderer, { source: detailProps().markdown });
				$$renderer.push(`<!----></article>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></main> `);

			if (metadataNodeId()) {
				$$renderer.push(`<!--[0--><aside${$.attr_class('shrink-0 overflow-y-auto p-4', void 0, {
					'w-72': layout === 'horizontal',
					'border-l': layout === 'horizontal',
					'border-t': layout === 'vertical'
				})}>`);

				NodeRenderer($$renderer, { nodeId: metadataNodeId(), uiTree, onDispatch });
				$$renderer.push(`<!----></aside>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}
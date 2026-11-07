import * as $ from 'svelte/internal/server';
import NodeRenderer from '$lib/components/NodeRenderer.svelte';
import List from '$lib/components/nodes/List.svelte';
import Grid from '$lib/components/nodes/Grid.svelte';
import Detail from '$lib/components/nodes/detail/Detail.svelte';

export default function Content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			rootNode,
			selectedItemNode,
			uiTree,
			onDispatch,
			onSelect,
			searchText
		} = $$props;

		const isShowingDetail = $.derived(() => rootNode?.type === 'List' && rootNode.props.isShowingDetail);
		const detailNodeId = $.derived(() => selectedItemNode?.namedChildren?.detail);

		$$renderer.push(`<div class="grid w-full grow overflow-y-auto"${$.attr_style('', {
			'grid-template-columns': isShowingDetail() ? '1fr 512px' : '1fr'
		})}><div class="h-full overflow-y-auto">`);

		if (rootNode) {
			$$renderer.push('<!--[0-->');

			if (rootNode.type === 'List') {
				$$renderer.push('<!--[0-->');
				List($$renderer, { nodeId: rootNode.id, uiTree, onSelect, searchText });
			} else if (rootNode.type === 'Grid') {
				$$renderer.push('<!--[1-->');

				Grid($$renderer, {
					nodeId: rootNode.id,
					uiTree,
					onDispatch,
					onSelect,
					searchText
				});
			} else if (rootNode.type === 'Detail') {
				$$renderer.push('<!--[2-->');
				Detail($$renderer, { nodeId: rootNode.id, uiTree, onDispatch });
			} else {
				$$renderer.push('<!--[-1-->');
				NodeRenderer($$renderer, { nodeId: rootNode.id, uiTree, onDispatch });
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> `);

		if (isShowingDetail()) {
			$$renderer.push(`<!--[0--><div class="h-full border-l">`);

			if (detailNodeId()) {
				$$renderer.push('<!--[0-->');
				NodeRenderer($$renderer, { nodeId: detailNodeId(), uiTree, onDispatch });
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}
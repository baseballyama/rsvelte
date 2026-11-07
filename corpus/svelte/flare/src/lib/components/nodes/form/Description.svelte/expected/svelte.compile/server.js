import * as $ from 'svelte/internal/server';
import { useTypedNode } from '$lib/node.svelte';

export default function Description($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { nodeId, uiTree } = $$props;

		const $$d = $.derived(useTypedNode(() => ({ nodeId, uiTree, type: 'Form.Description' }))),
			node = $.derived(() => $$d().node),
			componentProps = $.derived(() => $$d().props);

		if (node() && componentProps()) {
			$$renderer.push(`<!--[0--><div class="flex gap-4">`);

			if (componentProps().title) {
				$$renderer.push(`<!--[0--><h3 class="text-muted-foreground pt-2 text-right text-sm font-medium">${$.escape(componentProps().title)}</h3>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <p class="text-muted-foreground col-start-2 pt-2 text-sm">${$.escape(componentProps().text)}</p></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}
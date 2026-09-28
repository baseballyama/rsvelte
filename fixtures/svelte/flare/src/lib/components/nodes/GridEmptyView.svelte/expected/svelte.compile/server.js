import * as $ from 'svelte/internal/server';
import { useTypedNode } from '$lib/node.svelte';
import Icon from '$lib/components/Icon.svelte';
import defaultIcon from '$lib/assets/no-results-placeholder-400100x78@2x.png';

export default function GridEmptyView($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { nodeId, uiTree } = $$props;

		const $$d = $.derived(useTypedNode(() => ({ nodeId, uiTree, type: 'Grid.EmptyView' }))),
			componentProps = $.derived(() => $$d().props);

		if (componentProps()) {
			$$renderer.push(`<!--[0--><div class="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">`);

			if (componentProps().icon) {
				$$renderer.push('<!--[0-->');
				Icon($$renderer, { icon: componentProps().icon, class: 'size-32 opacity-50' });
			} else {
				$$renderer.push(`<!--[-1--><img${$.attr('src', defaultIcon)} class="mb-6 w-[90px]" alt="No results"/>`);
			}

			$$renderer.push(`<!--]--> <h2 class="text-lg font-medium">${$.escape(componentProps().title)}</h2> `);

			if (componentProps().description) {
				$$renderer.push(`<!--[0--><p class="text-muted-foreground max-w-md text-sm">${$.escape(componentProps().description)}</p>`);
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
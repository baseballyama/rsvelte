import * as $ from 'svelte/internal/server';
import ChevronRight from '../../../internal/components/chevron-right.svelte';
import { TreeViewNodeContext } from '../modules/node-context.js';
import { TreeViewRootContext } from '../modules/root-context.js';
import { mergeProps } from '@zag-js/svelte';

function chevronRight($$renderer) {
	ChevronRight($$renderer, { class: 'size-4' });
}

export default function Branch_indicator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const treeView = TreeViewRootContext.consume();
		const nodeProps = TreeViewNodeContext.consume();

		const element = $.derived(() => props.element),
			children = $.derived(() => $.fallback(props.children, chevronRight)),
			rest = $.derived(() => $.exclude_from_object(props, ['element', 'children']));

		const attributes = $.derived(() => mergeProps(treeView().getBranchIndicatorProps(nodeProps()), rest()));

		if (element()) {
			$$renderer.push('<!--[0-->');
			element()($$renderer, attributes());
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><span${$.attributes({ ...attributes() })}>`);
			children()?.($$renderer);
			$$renderer.push(`<!----></span>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}
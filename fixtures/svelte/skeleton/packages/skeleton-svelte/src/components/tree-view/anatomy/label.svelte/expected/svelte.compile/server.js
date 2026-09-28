import * as $ from 'svelte/internal/server';
import { TreeViewRootContext } from '../modules/root-context.js';
import { mergeProps } from '@zag-js/svelte';

export default function Label($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const treeView = TreeViewRootContext.consume();

		const level = $.derived(() => $.fallback(props.level, 3)),
			element = $.derived(() => props.element),
			children = $.derived(() => props.children),
			rest = $.derived(() => $.exclude_from_object(props, ['level', 'element', 'children']));

		const attributes = $.derived(() => mergeProps(treeView().getLabelProps(), rest()));
		const tag = $.derived(() => `h${level()}`);

		if (element()) {
			$$renderer.push('<!--[0-->');
			element()($$renderer, attributes());
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');

			$.element(
				$$renderer,
				tag(),
				() => {
					$$renderer.push(`${$.attributes({ ...attributes() })}`);
				},
				() => {
					children()?.($$renderer);
					$$renderer.push(`<!---->`);
				}
			);
		}

		$$renderer.push(`<!--]-->`);
	});
}
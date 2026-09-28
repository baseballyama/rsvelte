import * as $ from 'svelte/internal/server';
import { useCollapsible } from '../modules/provider.svelte';
import { CollapsibleRootContext } from '../modules/root-context.js';
import { splitProps } from '@zag-js/collapsible';
import { mergeProps } from '@zag-js/svelte';

export default function Root($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const id = $.props_id($$renderer);
		const { $$slots, $$events, ...props } = $$props;

		const $$d = $.derived(() => splitProps(props)),
			$$derived_array = $.derived(() => $.to_array($$d(), 2)),
			collapsibleProps = $.derived(() => $$derived_array()[0]),
			componentProps = $.derived(() => $$derived_array()[1]);

		const element = $.derived(() => componentProps().element),
			children = $.derived(() => componentProps().children),
			rest = $.derived(() => $.exclude_from_object(componentProps(), ['element', 'children']));

		const collapsible = useCollapsible(() => ({ ...collapsibleProps(), id }));
		const attributes = $.derived(() => mergeProps(collapsible().getRootProps(), rest()));

		CollapsibleRootContext.provide(() => collapsible());

		if (element()) {
			$$renderer.push('<!--[0-->');
			element()($$renderer, attributes());
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><div${$.attributes({ ...attributes() })}>`);
			children()?.($$renderer);
			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}
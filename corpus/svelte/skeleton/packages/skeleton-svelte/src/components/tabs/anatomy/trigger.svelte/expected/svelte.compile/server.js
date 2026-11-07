import * as $ from 'svelte/internal/server';
import { TabsRootContext } from '../modules/root-context.js';
import { mergeProps } from '@zag-js/svelte';
import { splitTriggerProps } from '@zag-js/tabs';

export default function Trigger($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const tabs = TabsRootContext.consume();

		const $$d = $.derived(() => splitTriggerProps(props)),
			$$derived_array = $.derived(() => $.to_array($$d(), 2)),
			triggerProps = $.derived(() => $$derived_array()[0]),
			componentProps = $.derived(() => $$derived_array()[1]);

		const element = $.derived(() => componentProps().element),
			children = $.derived(() => componentProps().children),
			rest = $.derived(() => $.exclude_from_object(componentProps(), ['element', 'children']));

		const attributes = $.derived(() => mergeProps(tabs().getTriggerProps(triggerProps()), rest()));

		if (element()) {
			$$renderer.push('<!--[0-->');
			element()($$renderer, attributes());
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><button${$.attributes({ ...attributes() })}>`);
			children()?.($$renderer);
			$$renderer.push(`<!----></button>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}
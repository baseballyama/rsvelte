import * as $ from 'svelte/internal/server';
import { FloatingPanelRootContext } from '../modules/root-context.js';
import { splitResizeTriggerProps } from '@zag-js/floating-panel';
import { mergeProps } from '@zag-js/svelte';

export default function Resize_trigger($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const floatingPanel = FloatingPanelRootContext.consume();

		const $$d = $.derived(() => splitResizeTriggerProps(props)),
			$$derived_array = $.derived(() => $.to_array($$d(), 2)),
			resizeTriggerProps = $.derived(() => $$derived_array()[0]),
			componentProps = $.derived(() => $$derived_array()[1]);

		const element = $.derived(() => componentProps().element),
			children = $.derived(() => componentProps().children),
			rest = $.derived(() => $.exclude_from_object(componentProps(), ['element', 'children']));

		const attributes = $.derived(() => mergeProps(floatingPanel().getResizeTriggerProps(resizeTriggerProps()), rest()));

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
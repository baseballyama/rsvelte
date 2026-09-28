import * as $ from 'svelte/internal/server';
import { FloatingPanelRootContext } from '../modules/root-context.js';
import { mergeProps } from '@zag-js/svelte';

export default function Stage_trigger($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const floatingPanel = FloatingPanelRootContext.consume();

		const element = $.derived(() => props.element),
			children = $.derived(() => props.children),
			stage = $.derived(() => props.stage),
			rest = $.derived(() => $.exclude_from_object(props, ['element', 'children', 'stage']));

		const attributes = $.derived(() => mergeProps(floatingPanel().getStageTriggerProps({ stage: stage() }), rest()));

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
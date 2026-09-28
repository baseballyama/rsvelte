import * as $ from 'svelte/internal/server';
import { useSwitch } from '../modules/provider.svelte';
import { SwitchRootContext } from '../modules/root-context.js';
import { mergeProps } from '@zag-js/svelte';
import { splitProps } from '@zag-js/switch';

export default function Root($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const id = $.props_id($$renderer);
		const { $$slots, $$events, ...props } = $$props;

		const $$d = $.derived(() => splitProps(props)),
			$$derived_array = $.derived(() => $.to_array($$d(), 2)),
			switchProps = $.derived(() => $$derived_array()[0]),
			componentProps = $.derived(() => $$derived_array()[1]);

		const element = $.derived(() => componentProps().element),
			children = $.derived(() => componentProps().children),
			rest = $.derived(() => $.exclude_from_object(componentProps(), ['element', 'children']));

		const switch_ = useSwitch(() => ({ ...switchProps(), id }));
		const attributes = $.derived(() => mergeProps(switch_().getRootProps(), rest()));

		SwitchRootContext.provide(() => switch_());

		if (element()) {
			$$renderer.push('<!--[0-->');
			element()($$renderer, attributes());
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><label${$.attributes({ ...attributes() })}>`);
			children()?.($$renderer);
			$$renderer.push(`<!----></label>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}
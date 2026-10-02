import * as $ from 'svelte/internal/server';
import ChevronDownIcon from '../../../internal/components/chevron-down.svelte';
import { ComboboxRootContext } from '../modules/root-context.js';
import { mergeProps } from '@zag-js/svelte';

function chevronDown($$renderer) {
	ChevronDownIcon($$renderer, {});
}

export default function Trigger($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const combobox = ComboboxRootContext.consume();

		const element = $.derived(() => props.element),
			children = $.derived(() => $.fallback(props.children, chevronDown)),
			rest = $.derived(() => $.exclude_from_object(props, ['element', 'children']));

		const attributes = $.derived(() => mergeProps(combobox().getTriggerProps(), rest()));

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
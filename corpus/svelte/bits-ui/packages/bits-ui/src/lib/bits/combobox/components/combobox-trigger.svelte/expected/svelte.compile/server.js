import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { useId } from "$lib/internal/use-id.js";
import { SelectComboTriggerState } from "$lib/bits/select/select.svelte.js";

export default function Combobox_trigger($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			id = useId(),
			ref = null,
			child,
			children,
			type = "button",
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const triggerState = SelectComboTriggerState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, triggerState.props, { type }));

		if (child) {
			$$renderer.push('<!--[0-->');
			child($$renderer, { props: mergedProps() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><button${$.attributes({ ...mergedProps() })}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></button>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref });
	});
}
import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { DialogTriggerState } from "../dialog.svelte.js";
import { createId } from "$lib/internal/create-id.js";

export default function Dialog_trigger($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			id = createId(uid),
			ref = null,
			children,
			child,
			disabled = false,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const triggerState = DialogTriggerState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			disabled: boxWith(() => Boolean(disabled))
		});

		const mergedProps = $.derived(() => mergeProps(restProps, triggerState.props));

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
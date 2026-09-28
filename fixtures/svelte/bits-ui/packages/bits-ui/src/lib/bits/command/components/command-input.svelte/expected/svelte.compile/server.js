import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { CommandInputState } from "../command.svelte.js";
import { createId } from "$lib/internal/create-id.js";

export default function Command_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			value = "",
			autofocus = false,
			id = createId(uid),
			ref = null,
			child,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const inputState = CommandInputState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			value: boxWith(() => value, (v) => {
				value = v;
			}),
			autofocus: boxWith(() => autofocus ?? false)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, inputState.props));

		if (child) {
			$$renderer.push('<!--[0-->');
			child($$renderer, { props: mergedProps() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><input${$.attributes({ ...mergedProps(), value }, void 0, void 0, void 0, 4)}/>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { value, ref });
	});
}
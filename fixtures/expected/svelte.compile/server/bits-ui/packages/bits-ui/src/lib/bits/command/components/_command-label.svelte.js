import * as $ from 'svelte/internal/server';
import { boxWith } from "svelte-toolbelt";
import { CommandLabelState } from "../command.svelte.js";
import { createId } from "$lib/internal/create-id.js";
import { mergeProps } from "svelte-toolbelt";

export default function _command_label($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			id = createId(uid),
			ref = null,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const labelState = CommandLabelState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, labelState.props));

		$$renderer.push(`<label${$.attributes({ ...mergedProps() })}>`);
		children?.($$renderer);
		$$renderer.push(`<!----></label>`);
		$.bind_props($$props, { ref });
	});
}
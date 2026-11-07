import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { DateFieldInputState } from "../date-field.svelte.js";
import DateFieldHiddenInput from "./date-field-hidden-input.svelte";
import { createId } from "$lib/internal/create-id.js";

export default function Date_field_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			id = createId(uid),
			ref = null,
			name = "",
			children,
			child,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const inputState = DateFieldInputState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			name: boxWith(() => name)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, inputState.props));

		if (child) {
			$$renderer.push('<!--[0-->');

			child($$renderer, {
				props: mergedProps(),
				segments: inputState.root.segmentContents
			});

			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><div${$.attributes({ ...mergedProps() })}>`);
			children?.($$renderer, { segments: inputState.root.segmentContents });
			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]--> `);
		DateFieldHiddenInput($$renderer, {});
		$$renderer.push(`<!---->`);
		$.bind_props($$props, { ref });
	});
}
import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { DateRangeFieldInputState } from "../date-range-field.svelte.js";
import { createId } from "$lib/internal/create-id.js";
import DateFieldHiddenInput from "$lib/bits/date-field/components/date-field-hidden-input.svelte";

export default function Date_range_field_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			id = createId(uid),
			ref = null,
			name = "",
			child,
			children,
			type,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const inputState = DateRangeFieldInputState.create(
			{
				id: boxWith(() => id),
				ref: boxWith(() => ref, (v) => ref = v),
				name: boxWith(() => name)
			},
			type
		);

		const mergedProps = $.derived(() => mergeProps(restProps, inputState.props, { role: "presentation" }));

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
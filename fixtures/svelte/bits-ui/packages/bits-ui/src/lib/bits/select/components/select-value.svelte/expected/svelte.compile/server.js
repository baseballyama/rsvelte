import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { SelectValueState } from "../select.svelte.js";
import { createId } from "$lib/internal/create-id.js";

export default function Select_value($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			ref = null,
			id = createId(uid),
			placeholder,
			child,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const valueState = SelectValueState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			placeholder: boxWith(() => placeholder)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, valueState.props));

		if (child) {
			$$renderer.push('<!--[0-->');
			child($$renderer, { props: mergedProps(), ...valueState.snippetProps });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><span${$.attributes({ ...mergedProps() })}>`);

			if (children) {
				$$renderer.push('<!--[0-->');
				children?.($$renderer, valueState.snippetProps);
				$$renderer.push(`<!---->`);
			} else if (valueState.snippetProps.selection.type === "single") {
				$$renderer.push(`<!--[1-->${$.escape(valueState.snippetProps.selection.selected?.label ?? placeholder)}`);
			} else if (valueState.snippetProps.selection.type === "multiple" && valueState.snippetProps.selection.selected) {
				$$renderer.push(`<!--[2-->${$.escape(valueState.snippetProps.selection.selected.length > 0
					? valueState.snippetProps.selection.selected.map((selected) => selected.label).join(", ")
					: placeholder)}`);
			} else {
				$$renderer.push(`<!--[-1-->${$.escape(placeholder)}`);
			}

			$$renderer.push(`<!--]--></span>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref });
	});
}
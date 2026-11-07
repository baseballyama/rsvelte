import * as $ from 'svelte/internal/server';
import { boxWith } from "svelte-toolbelt";
import { mergeProps } from "svelte-toolbelt";
import { ToolbarGroupState } from "../toolbar.svelte.js";
import { createId } from "$lib/internal/create-id.js";
import { noop } from "$lib/internal/noop.js";
import { watch } from "runed";

export default function Toolbar_group($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			id = createId(uid),
			ref = null,
			value = void 0,
			onValueChange = noop,
			type,
			disabled = false,
			child,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		function handleDefaultValue() {
			if (value !== undefined) return;

			value = type === "single" ? "" : [];
		}

		// SSR
		handleDefaultValue();

		watch.pre(() => value, () => {
			handleDefaultValue();
		});

		const groupState = ToolbarGroupState.create({
			id: boxWith(() => id),
			disabled: boxWith(() => disabled),
			type,
			value: boxWith(() => value, (v) => {
				value = v;

				// @ts-expect-error - we know
				onValueChange(v);
			}),
			ref: boxWith(() => ref, (v) => ref = v)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, groupState.props));

		if (child) {
			$$renderer.push('<!--[0-->');
			child($$renderer, { props: mergedProps() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><div${$.attributes({ ...mergedProps() })}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref, value });
	});
}
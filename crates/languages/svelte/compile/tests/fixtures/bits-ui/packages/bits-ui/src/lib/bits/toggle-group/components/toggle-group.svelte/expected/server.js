import * as $ from 'svelte/internal/server';
import { boxWith } from "svelte-toolbelt";
import { mergeProps } from "svelte-toolbelt";
import { ToggleGroupRootState } from "../toggle-group.svelte.js";
import { createId } from "$lib/internal/create-id.js";
import { noop } from "$lib/internal/noop.js";
import { watch } from "runed";

export default function Toggle_group($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			id = createId(uid),
			ref = null,
			value = void 0,
			onValueChange = noop,
			type,
			disabled = false,
			loop = true,
			orientation = "horizontal",
			rovingFocus = true,
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

		const rootState = ToggleGroupRootState.create({
			id: boxWith(() => id),
			value: boxWith(() => value, (v) => {
				value = v;

				// @ts-expect-error - we know
				onValueChange(v);
			}),
			disabled: boxWith(() => disabled),
			loop: boxWith(() => loop),
			orientation: boxWith(() => orientation),
			rovingFocus: boxWith(() => rovingFocus),
			type,
			ref: boxWith(() => ref, (v) => ref = v)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, rootState.props));

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
import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { AccordionRootState } from "../accordion.svelte.js";
import { noop } from "$lib/internal/noop.js";
import { watch } from "runed";
import { createId } from "$lib/internal/create-id.js";

export default function Accordion($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			disabled = false,
			children,
			child,
			type,
			value = void 0,
			ref = null,
			id = createId(uid),
			onValueChange = noop,
			loop = true,
			orientation = "vertical",
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

		const rootState = AccordionRootState.create({
			type,
			value: boxWith(() => value, (v) => {
				value = v;

				// oxlint-disable-next-line no-explicit-any
				onValueChange(v);
			}),
			id: boxWith(() => id),
			disabled: boxWith(() => disabled),
			loop: boxWith(() => loop),
			orientation: boxWith(() => orientation),
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
		$.bind_props($$props, { value, ref });
	});
}
import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { useId } from "$lib/internal/use-id.js";
import { FloatingLayer } from "$lib/bits/utilities/floating-layer/index.js";
import { SelectInputState } from "$lib/bits/select/select.svelte.js";

export default function Combobox_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			id = useId(),
			ref = null,
			child,
			defaultValue,
			clearOnDeselect = false,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const inputState = SelectInputState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			clearOnDeselect: boxWith(() => clearOnDeselect)
		});

		if (defaultValue) {
			inputState.root.opts.inputValue.current = defaultValue;
		}

		const mergedProps = $.derived(() => mergeProps(restProps, inputState.props, { value: inputState.root.opts.inputValue.current }));

		if (FloatingLayer.Anchor) {
			$$renderer.push('<!--[-->');

			FloatingLayer.Anchor($$renderer, {
				id,
				ref: inputState.opts.ref,
				children: ($$renderer) => {
					if (child) {
						$$renderer.push('<!--[0-->');
						child($$renderer, { props: mergedProps() });
						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push(`<!--[-1--><input${$.attributes({ ...mergedProps() }, void 0, void 0, void 0, 4)}/>`);
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$.bind_props($$props, { ref });
	});
}
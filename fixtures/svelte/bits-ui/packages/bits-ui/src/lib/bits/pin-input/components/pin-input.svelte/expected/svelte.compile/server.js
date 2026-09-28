import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { PinInputRootState } from "../pin-input.svelte.js";
import { createId } from "$lib/internal/create-id.js";
import { noop } from "$lib/internal/noop.js";

export default function Pin_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			id = createId(uid),
			inputId = `${createId(uid)}-input`,
			ref = null,
			inputRef = null,
			maxlength = 6,
			textalign = "left",
			pattern,
			inputmode = "numeric",
			onComplete = noop,
			pushPasswordManagerStrategy = "increase-width",
			class: containerClass = "",
			children,
			autocomplete = "one-time-code",
			disabled = false,
			value = "",
			onValueChange = noop,
			pasteTransformer,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const rootState = PinInputRootState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			inputRef: boxWith(() => inputRef, (v) => inputRef = v),
			inputId: boxWith(() => inputId),
			autocomplete: boxWith(() => autocomplete),
			maxLength: boxWith(() => maxlength),
			textAlign: boxWith(() => textalign),
			disabled: boxWith(() => disabled),
			inputmode: boxWith(() => inputmode),
			pattern: boxWith(() => pattern),
			onComplete: boxWith(() => onComplete),
			value: boxWith(() => value, (v) => {
				value = v;
				onValueChange(v);
			}),
			pushPasswordManagerStrategy: boxWith(() => pushPasswordManagerStrategy),
			pasteTransformer: boxWith(() => pasteTransformer)
		});

		const mergedInputProps = $.derived(() => mergeProps(restProps, rootState.inputProps));
		const mergedRootProps = $.derived(() => mergeProps(rootState.rootProps, { class: containerClass }));
		const mergedInputWrapperProps = $.derived(() => mergeProps(rootState.inputWrapperProps, {}));

		$$renderer.push(`<div${$.attributes({ ...mergedRootProps() })}>`);
		children?.($$renderer, rootState.snippetProps);
		$$renderer.push(`<!----> <div${$.attributes({ ...mergedInputWrapperProps() })}><input${$.attributes({ ...mergedInputProps() }, void 0, void 0, void 0, 4)}/></div></div>`);
		$.bind_props($$props, { ref, inputRef, value });
	});
}
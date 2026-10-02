import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { MenuRadioItemState } from "../menu.svelte.js";
import { createId } from "$lib/internal/create-id.js";
import { noop } from "$lib/internal/noop.js";

export default function Menu_radio_item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			children,
			child,
			ref = null,
			value,
			onSelect = noop,
			id = createId(uid),
			disabled = false,
			closeOnSelect = true,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const radioItemState = MenuRadioItemState.create({
			value: boxWith(() => value),
			id: boxWith(() => id),
			disabled: boxWith(() => disabled),
			onSelect: boxWith(() => handleSelect),
			ref: boxWith(() => ref, (v) => ref = v),
			closeOnSelect: boxWith(() => closeOnSelect)
		});

		function handleSelect(e) {
			onSelect(e);

			if (e.defaultPrevented) return;

			radioItemState.selectValue();
		}

		const mergedProps = $.derived(() => mergeProps(restProps, radioItemState.props));

		if (child) {
			$$renderer.push('<!--[0-->');
			child($$renderer, { props: mergedProps(), checked: radioItemState.isChecked });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><div${$.attributes({ ...mergedProps() })}>`);
			children?.($$renderer, { checked: radioItemState.isChecked });
			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref });
	});
}
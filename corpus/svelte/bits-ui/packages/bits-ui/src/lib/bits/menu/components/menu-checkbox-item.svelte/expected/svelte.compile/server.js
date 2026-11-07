import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { MenuCheckboxGroupContext, MenuCheckboxItemState } from "../menu.svelte.js";
import { createId } from "$lib/internal/create-id.js";
import { noop } from "$lib/internal/noop.js";
import { watch } from "runed";

export default function Menu_checkbox_item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			child,
			children,
			ref = null,
			checked = false,
			id = createId(uid),
			onCheckedChange = noop,
			disabled = false,
			onSelect = noop,
			closeOnSelect = true,
			indeterminate = false,
			onIndeterminateChange = noop,
			value = "",
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const group = MenuCheckboxGroupContext.getOr(null);

		if (group && value) {
			if (group.opts.value.current.includes(value)) {
				checked = true;
			} else {
				checked = false;
			}
		}

		watch.pre(() => value, () => {
			if (group && value) {
				if (group.opts.value.current.includes(value)) {
					checked = true;
				} else {
					checked = false;
				}
			}
		});

		const checkboxItemState = MenuCheckboxItemState.create(
			{
				checked: boxWith(() => checked, (v) => {
					if (v !== checked) {
						checked = v;
						onCheckedChange(v);
					}
				}),
				id: boxWith(() => id),
				disabled: boxWith(() => disabled),
				onSelect: boxWith(() => handleSelect),
				ref: boxWith(() => ref, (v) => ref = v),
				closeOnSelect: boxWith(() => closeOnSelect),
				indeterminate: boxWith(() => indeterminate, (v) => {
					if (v !== indeterminate) {
						indeterminate = v;
						onIndeterminateChange(v);
					}
				}),
				value: boxWith(() => value)
			},
			group
		);

		function handleSelect(e) {
			onSelect(e);

			if (e.defaultPrevented) return;

			checkboxItemState.toggleChecked();
		}

		const mergedProps = $.derived(() => mergeProps(restProps, checkboxItemState.props));

		if (child) {
			$$renderer.push('<!--[0-->');
			child($$renderer, { checked, indeterminate, props: mergedProps() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><div${$.attributes({ ...mergedProps() })}>`);
			children?.($$renderer, { checked, indeterminate });
			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref, checked, indeterminate });
	});
}
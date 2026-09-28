import * as $ from 'svelte/internal/server';
import Check from "$lib/icons/check.svelte";
import { getContext } from "svelte";

import {
	resolveCheckboxCheckClass,
	resolveCheckboxContClass,
	resolveDescriptionClass,
	resolveItemLabelClass,
	resolveRadioContClass,
	resolveRadioDotClass,
	resolveTitleClass
} from "./styles.js";

export default function Item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const unique = $.props_id($$renderer);

		let {
			defaultChecked = false,
			disabled = false,
			description = undefined,
			title = undefined,
			value,
			children = undefined,
			class: klass,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const groupState = getContext("choicebox");
		let isDisabled = $.derived(() => disabled || groupState.disabledParent);

		let isSelected = $.derived(() => {
			const current = groupState.get();

			if (groupState.type === "radio") return current === value;

			return Array.isArray(current) && current.includes(value);
		});

		let defaultApplied = false;

		function handleChange(evt) {
			const target = evt.currentTarget;

			if (groupState.type === "radio") {
				groupState.set(target.value);
			} else if (groupState.type === "checkbox") {
				const current = groupState.get();
				const val = target.value;

				if (current.includes(val)) {
					groupState.set(current.filter((item) => item !== val));
				} else {
					groupState.set([...current, val]);
				}
			}
		}

		let labelClass = $.derived(() => resolveItemLabelClass({ disabled: isDisabled(), selected: isSelected() }));
		let titleClass = $.derived(() => resolveTitleClass({ disabled: isDisabled(), selected: isSelected() }));
		let descriptionClass = $.derived(() => resolveDescriptionClass({ disabled: isDisabled(), selected: isSelected() }));
		let radioContClass = $.derived(() => resolveRadioContClass({ disabled: isDisabled(), selected: isSelected() }));
		let radioDotClass = $.derived(() => resolveRadioDotClass({ selected: isSelected() }));
		let checkboxContClass = $.derived(() => resolveCheckboxContClass({ disabled: isDisabled(), selected: isSelected() }));
		let checkboxCheckClass = $.derived(() => resolveCheckboxCheckClass({ selected: isSelected() }));

		function radio($$renderer) {
			if (groupState.type === "radio") {
				$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(radioContClass()))}><div class="flex h-4 w-4 items-center justify-center"><input type="radio"${$.attr('checked', isSelected(), true)}${$.attr('id', unique)}${$.attr('name', groupState.name)}${$.attr('value', value)}${$.attr('disabled', isDisabled(), true)} class="peer sr-only"/> <div${$.attr_class($.clsx(radioDotClass()))}></div></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		function checkbox($$renderer) {
			if (groupState.type === "checkbox") {
				$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(checkboxContClass()))}><div class="flex h-4 w-4 items-center justify-center"><input type="checkbox"${$.attr('checked', isSelected(), true)}${$.attr('id', unique)}${$.attr('name', groupState.name)}${$.attr('value', value)}${$.attr('disabled', isDisabled(), true)} class="peer sr-only"/> <div${$.attr_class($.clsx(checkboxCheckClass()))}>`);
				Check($$renderer, {});
				$$renderer.push(`<!----></div></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<label${$.attributes({ for: unique, class: $.clsx([labelClass(), klass]), ...rest })}><div class="flex w-full items-center justify-between p-3"><div class="w-full">`);

		if (title) {
			$$renderer.push(`<!--[0--><p${$.attr_class($.clsx(titleClass()))}>${$.escape(title)}</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (description) {
			$$renderer.push(`<!--[0--><p${$.attr_class($.clsx(descriptionClass()))}>${$.escape(description)}</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (children && isSelected()) {
			$$renderer.push(`<!--[0--><div class="mt-2 w-full">`);
			children($$renderer);
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> `);
		radio($$renderer);
		$$renderer.push(`<!----> `);
		checkbox($$renderer);
		$$renderer.push(`<!----></div></label>`);
	});
}
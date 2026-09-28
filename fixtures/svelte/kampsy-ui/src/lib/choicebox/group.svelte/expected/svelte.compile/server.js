import * as $ from 'svelte/internal/server';
import { randomString } from "$lib/utils/random.js";
import { setContext } from "svelte";
import { createGroupState } from "./group.svelte.js";
import { groupRootBase, listBase, resolveGroupLabelClass } from "./styles.js";

export default function Group($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			type = "radio",
			label = undefined,
			value = "",
			disabled = false,
			showLabel = true,
			listClassName = undefined,
			onchange = undefined,
			children = undefined,
			class: klass,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const groupState = createGroupState({
			selected: "",
			name: randomString(8),
			get type() {
				return type;
			},

			get disabledParent() {
				return disabled;
			},
			onchange: (value) => onchange?.(value)
		});

		setContext("choicebox", groupState);

		let legendClass = $.derived(() => {
			return [
				resolveGroupLabelClass({ disabled }),
				!showLabel && "sr-only"
			];
		});

		$$renderer.push(`<fieldset${$.attributes({ class: $.clsx([groupRootBase, klass]), ...rest })}>`);

		if (label) {
			$$renderer.push(`<!--[0--><legend${$.attr_class($.clsx(legendClass()))}>${$.escape(label)}</legend>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div${$.attr_class($.clsx([listBase, listClassName]))}>`);

		if (children) {
			$$renderer.push('<!--[0-->');
			children($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></fieldset>`);
		$.bind_props($$props, { value });
	});
}
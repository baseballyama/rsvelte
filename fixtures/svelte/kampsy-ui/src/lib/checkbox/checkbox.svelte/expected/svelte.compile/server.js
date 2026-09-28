import * as $ from 'svelte/internal/server';
import Check from "$lib/icons/check.svelte";
import Minus from "$lib/icons/minus.svelte";

import {
	resolveBoxClass,
	resolveIconClass,
	resolveLabelClass,
	resolveRootClass
} from "./styles.js";

export default function Checkbox($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const fallbackId = $.props_id($$renderer);

		let {
			id: idProp,
			class: klass,
			checked = false,
			indeterminate = false,
			disabled = false,
			children,
			onclick,
			$$slots,
			$$events,
			...rest
		} = $$props;

		let id = $.derived(() => idProp ?? fallbackId);

		const handleClick = (evt) => {
			if (indeterminate) {
				evt.preventDefault();
			}

			onclick?.(evt);
		};

		let boxClass = $.derived(() => resolveBoxClass({ checked, indeterminate, disabled }));
		let iconClass = $.derived(() => resolveIconClass({ checked, indeterminate, disabled }));
		let labelClass = $.derived(() => resolveLabelClass({ disabled }));
		let rootClass = $.derived(() => resolveRootClass({ disabled }));

		$$renderer.push(`<label${$.attr('for', id())}${$.attr_class($.clsx([rootClass(), klass]))}><span class="relative flex items-center justify-center"><input${$.attributes(
			{
				...rest,
				type: 'checkbox',
				id: id(),
				checked,
				indeterminate,
				disabled,
				class: 'peer sr-only'
			},
			void 0,
			void 0,
			void 0,
			4
		)}/> <span${$.attr_class($.clsx(boxClass()))} aria-hidden="true"><span${$.attr_class($.clsx(iconClass()))}>`);

		if (indeterminate) {
			$$renderer.push('<!--[0-->');
			Minus($$renderer, {});
		} else if (checked) {
			$$renderer.push('<!--[1-->');
			Check($$renderer, {});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></span></span></span> `);

		if (children) {
			$$renderer.push(`<!--[0--><span${$.attr_class($.clsx(labelClass()))}>`);
			children($$renderer);
			$$renderer.push(`<!----></span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></label>`);
		$.bind_props($$props, { checked });
	});
}
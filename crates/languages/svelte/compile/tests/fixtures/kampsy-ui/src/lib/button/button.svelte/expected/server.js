import * as $ from 'svelte/internal/server';
import LoaderCircle from "$lib/icons/loader-circle.svelte";
import { resolveButtonClass, iconSizeStyles } from "./styles.js";

export default function Button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			buttonElement = void 0,
			class: klass,
			shape = undefined,
			size = "medium",
			variant = "default",
			prefix = undefined,
			suffix = undefined,
			svgOnly = false,
			shadow = false,
			loading = false,
			disabled = false,
			type = "button",
			onclick,
			children,
			$$slots,
			$$events,
			...rest
		} = $$props;

		let iconSize = $.derived(() => iconSizeStyles[size]);

		let buttonClass = $.derived(() => resolveButtonClass({
			size,
			variant,
			shape,
			svgOnly,
			shadow,
			disabled,
			loading,
			class: klass
		}));

		let isInactive = $.derived(() => disabled || loading);

		function handleClick(event) {
			if (isInactive()) {
				event.preventDefault();
				event.stopImmediatePropagation();

				return;
			}

			onclick?.(event);
		}

		$$renderer.push(`<button${$.attributes({
			...rest,
			type,
			disabled: disabled || undefined,
			'aria-disabled': isInactive() ? true : undefined,
			'aria-busy': loading ? true : undefined,
			class: $.clsx(buttonClass())
		})}>`);

		if (svgOnly) {
			$$renderer.push('<!--[0-->');

			if (loading) {
				$$renderer.push(`<!--[0--><span${$.attr_class(`${$.stringify(iconSize())} flex animate-spin items-center justify-center`)} aria-hidden="true">`);
				LoaderCircle($$renderer, {});
				$$renderer.push(`<!----></span>`);
			} else if (children) {
				$$renderer.push(`<!--[1--><span${$.attr_class(`${$.stringify(iconSize())} flex items-center justify-center`)}>`);
				children($$renderer);
				$$renderer.push(`<!----></span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');

			if (loading) {
				$$renderer.push(`<!--[0--><span${$.attr_class(`${$.stringify(iconSize())} flex animate-spin items-center justify-center`)} aria-hidden="true">`);
				LoaderCircle($$renderer, {});
				$$renderer.push(`<!----></span>`);
			} else if (prefix) {
				$$renderer.push(`<!--[1--><span${$.attr_class(`${$.stringify(iconSize())} flex items-center justify-center`)}>`);
				prefix($$renderer);
				$$renderer.push(`<!----></span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (children) {
				$$renderer.push(`<!--[0--><span class="inline-flex items-center px-1.5">`);
				children($$renderer);
				$$renderer.push(`<!----></span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (!loading && suffix) {
				$$renderer.push(`<!--[0--><span${$.attr_class(`${$.stringify(iconSize())} flex items-center justify-center`)}>`);
				suffix($$renderer);
				$$renderer.push(`<!----></span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--></button>`);
		$.bind_props($$props, { buttonElement });
	});
}
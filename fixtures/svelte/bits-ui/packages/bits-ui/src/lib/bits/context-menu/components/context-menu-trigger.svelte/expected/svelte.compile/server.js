import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { ContextMenuTriggerState } from "$lib/bits/menu/menu.svelte.js";
import { useId } from "$lib/internal/use-id.js";
import { FloatingLayer } from "$lib/bits/utilities/floating-layer/index.js";

export default function Context_menu_trigger($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			id = useId(),
			ref = null,
			child,
			children,
			disabled = false,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const triggerState = ContextMenuTriggerState.create({
			id: boxWith(() => id),
			disabled: boxWith(() => disabled),
			ref: boxWith(() => ref, (v) => ref = v)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, triggerState.props, { style: { pointerEvents: "auto" } }, { style: restProps.style, tabindex: restProps.tabindex }));

		if (FloatingLayer.Anchor) {
			$$renderer.push('<!--[-->');

			FloatingLayer.Anchor($$renderer, {
				id,
				virtualEl: triggerState.virtualElement,
				ref: triggerState.opts.ref,
				children: ($$renderer) => {
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
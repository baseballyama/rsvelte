import * as $ from 'svelte/internal/server';
import { GroupState } from './Group.shared.svelte.js';

export default function Group_html($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			preventTouchMove = false,
			transitionIn: transitionInProp,
			transitionInParams: transitionInParamsProp,
			class: className,
			children,
			ref: refProp = void 0,
			// Internal-only: pulled out so `{...rest}` doesn't pollute DOM attrs.
			x,
			y,
			initialX,
			initialY,
			data,
			key,
			center,
			motion,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const c = new GroupState(() => ({
			preventTouchMove,
			transitionIn: transitionInProp,
			transitionInParams: transitionInParamsProp,
			class: className,
			children,
			x,
			y,
			initialX,
			initialY,
			data,
			key,
			center,
			motion,
			...rest
		}));

		let ref = void 0;
		const transitionIn = $.derived(() => transitionInProp ?? c.defaultTransitionIn);
		const transitionInParams = $.derived(() => transitionInParamsProp ?? c.defaultTransitionInParams);

		const handleTouchMove = (e) => {
			if (preventTouchMove) {
				e.preventDefault();
			}

			rest.ontouchmove?.(e);
		};

		if (c.dataMode) {
			$$renderer.push(`<!--[0--><!--[-->`);

			const each_array = $.ensure_array_like(c.resolvedItems);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let item = each_array[$$index];

				$$renderer.push(`<div${$.attributes({ ...rest, class: $.clsx(['lc-group-div', className]) }, 'svelte-1w6wis', void 0, {
					transform: `translate(${$.stringify(item.x)}px, ${$.stringify(item.y)}px)`,
					opacity: rest.opacity
				})}>`);

				children?.($$renderer);
				$$renderer.push(`<!----></div>`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push(`<!--[-1--><div${$.attributes({ ...rest, class: $.clsx(['lc-group-div', className]) }, 'svelte-1w6wis', void 0, { transform: c.transform, opacity: rest.opacity })}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref: refProp });
	});
}
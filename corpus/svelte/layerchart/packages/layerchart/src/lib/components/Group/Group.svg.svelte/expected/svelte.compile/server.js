import * as $ from 'svelte/internal/server';
import { GroupState } from './Group.shared.svelte.js';

export default function Group_svg($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			preventTouchMove = false,
			transitionIn: transitionInProp,
			transitionInParams: transitionInParamsProp,
			class: className,
			children,
			ref: refProp = void 0,
			// Pull out props that collide with `<g>` SVG attribute names so the
			// `{...rest}` spread doesn't mistakenly set `x="someAccessor"` etc.
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

				$$renderer.push(`<g${$.attributes(
					{
						class: $.clsx(['lc-group-g', className]),
						opacity: rest.opacity,
						...rest
					},
					void 0,
					void 0,
					{
						transform: `translate(${$.stringify(item.x)}px, ${$.stringify(item.y)}px)`
					},
					3
				)}>`);

				children?.($$renderer);
				$$renderer.push(`<!----></g>`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push(`<!--[-1--><g${$.attributes(
				{
					class: $.clsx(['lc-group-g', className]),
					opacity: rest.opacity,
					...rest
				},
				void 0,
				void 0,
				{ transform: c.transform },
				3
			)}>`);

			children?.($$renderer);
			$$renderer.push(`<!----></g>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref: refProp });
	});
}
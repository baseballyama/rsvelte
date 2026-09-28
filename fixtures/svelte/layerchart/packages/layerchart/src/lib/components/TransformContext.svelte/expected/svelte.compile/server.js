import * as $ from 'svelte/internal/server';
import { getChartContext } from '$lib/contexts/chart.js';
import { TransformState } from '$lib/states/transform.svelte.js';

export default function TransformContext($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			state: stateProp = void 0,
			onwheel = () => {},
			onpointerdown = () => {},
			onpointermove = () => {},
			ontouchmove = () => {},
			onpointerup = () => {},
			onpointercancel = () => {},
			ondblclick = () => {},
			onclickcapture = () => {},
			ref: refProp = void 0,
			children,
			class: className,
			mode,
			axis,
			motion,
			processTranslate,
			disablePointer,
			scrollMode,
			clickDistance,
			initialTranslate,
			initialScale,
			onTransform,
			ondragstart,
			ondragend,
			scaleExtent,
			translateExtent,
			constrain,
			inertia,
			pinch,
			scrollActivationKey,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const options = {
			mode,
			axis,
			motion,
			processTranslate,
			disablePointer,
			scrollMode,
			clickDistance,
			initialTranslate,
			initialScale,
			onTransform,
			ondragstart,
			ondragend,
			scaleExtent,
			translateExtent,
			constrain,
			inertia,
			pinch,
			scrollActivationKey
		};

		let ref = void 0;
		const ctx = getChartContext();

		// Create TransformState instance
		const transformState = new TransformState(ctx, options);

		// Sync initial transform values when they change (e.g., when projection changes for geo transforms)
		// Only reset if values actually changed from current initial values
		// Bind `state` prop
		stateProp = transformState;

		function onPointerDown(e) {
			onpointerdown?.(e);
			transformState.onPointerDown(e);
		}

		function onPointerMove(e) {
			onpointermove?.(e);
			transformState.onPointerMove(e);
		}

		function onPointerUp(e) {
			onpointerup?.(e);
			transformState.onPointerUp(e);
		}

		function onPointerCancel(e) {
			onpointercancel?.(e);
			transformState.onPointerCancel(e);
		}

		function onClick(e) {
			onclickcapture?.(e);

			if (transformState.dragging) {
				// Do not propagate click event to children if drag/moved.  Registered in capture phase (top-down)
				e.stopPropagation();
			}
		}

		function onDoubleClick(e) {
			ondblclick?.(e);
			transformState.onDoubleClick(e);
		}

		function onWheel(e) {
			onwheel?.(e);
			transformState.onWheel(e);
		}

		$$renderer.push(`<div${$.attributes(
			{
				class: $.clsx(
					// Touch events cause pointer events to be interrupted.
					// Typically `touch-action: none` works, but doesn't appear to with SVG, but `preventDefault()` works here
					// https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events#touch-action_css_property
					['lc-transform-context', className]
				),
				...restProps
			},
			'svelte-1fzgqyj',
			void 0,
			{
				'touch-action': mode && mode !== 'none' && !disablePointer ? 'none' : undefined
			}
		)}>`);

		children?.($$renderer, { transformState });
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { state: stateProp, ref: refProp });
	});
}
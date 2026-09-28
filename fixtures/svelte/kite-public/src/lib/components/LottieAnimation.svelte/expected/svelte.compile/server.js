import * as $ from 'svelte/internal/server';
import lottie from 'lottie-web';
import { onDestroy, onMount } from 'svelte';

export default function LottieAnimation($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Number of frames to cut from the end before looping
		let {
			animationData,
			loop = true,
			autoplay = true,
			width = 100,
			height = 100,
			class: className = '',
			loopFrameOffset = 0
		} = $$props;

		let container = undefined; // Assigned via bind:this
		let animation = null;

		onMount(() => {
			if (container && animationData) {
				// For animations with frame offset, we need to modify the animation data
				let modifiedData = animationData;

				if (loop && loopFrameOffset > 0 && animationData.op) {
					// Clone the animation data to avoid modifying the original
					modifiedData = {
						...animationData,
						// Reduce the out point (op) by the offset
						op: Math.max(animationData.ip || 0, animationData.op - loopFrameOffset)
					};
				}

				animation = lottie.loadAnimation({
					container,
					renderer: 'svg',
					loop,
					autoplay,
					animationData: modifiedData,
					rendererSettings: { preserveAspectRatio: 'xMidYMid slice' }
				});
			}
		});

		onDestroy(() => {
			if (animation) {
				animation.destroy();
			}
		});

		$$renderer.push(`<div${$.attr_class($.clsx(className))}${$.attr_style(`width: ${$.stringify(width)}px; height: ${$.stringify(height)}px;`)}></div>`);
	});
}
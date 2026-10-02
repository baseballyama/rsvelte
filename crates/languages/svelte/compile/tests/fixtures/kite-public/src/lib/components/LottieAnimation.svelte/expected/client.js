import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import lottie from 'lottie-web';
import { onDestroy, onMount } from 'svelte';

var root = $.from_html(`<div></div>`);

export default function LottieAnimation($$anchor, $$props) {
	$.push($$props, true);

	// Number of frames to cut from the end before looping
	let loop = $.prop($$props, 'loop', 3, true),
		autoplay = $.prop($$props, 'autoplay', 3, true),
		width = $.prop($$props, 'width', 3, 100),
		height = $.prop($$props, 'height', 3, 100),
		className = $.prop($$props, 'class', 3, ''),
		loopFrameOffset = $.prop($$props, 'loopFrameOffset', 3, 0);

	let container = undefined; // Assigned via bind:this
	let animation = null;

	onMount(() => {
		if (container && $$props.animationData) {
			// For animations with frame offset, we need to modify the animation data
			let modifiedData = $$props.animationData;

			if (loop() && loopFrameOffset() > 0 && $$props.animationData.op) {
				// Clone the animation data to avoid modifying the original
				modifiedData = {
					...$$props.animationData,
					// Reduce the out point (op) by the offset
					op: Math.max($$props.animationData.ip || 0, $$props.animationData.op - loopFrameOffset())
				};
			}

			animation = lottie.loadAnimation({
				container,
				renderer: 'svg',
				loop: loop(),
				autoplay: autoplay(),
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

	var div = root();

	$.bind_this(div, ($$value) => container = $$value, () => container);

	$.template_effect(() => {
		$.set_class(div, 1, $.clsx(className()));
		$.set_style(div, `width: ${width() ?? ''}px; height: ${height() ?? ''}px;`);
	});

	$.append($$anchor, div);
	$.pop();
}
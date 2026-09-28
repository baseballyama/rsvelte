import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { tweened } from 'svelte/motion';
import { backOut } from 'svelte/easing';

export default function Ripple($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { x, y, sizeIn, size, speed, rippleBlur, opacityIn } = $$props;

		onMount(() => {
			rippleOpacity.set(0);
			rippleSize.set(size);
		});

		const rippleSize = tweened(sizeIn, { duration: speed });
		const rippleOpacity = tweened(opacityIn, { duration: speed + speed * 2.5, easing: backOut });

		$$renderer.push(`<defs><filter id="f1" x="0" y="0"><feGaussianBlur in="SourceGraphic"${$.attr('stdDeviation', rippleBlur)}></feGaussianBlur></filter></defs><circle${$.attr('cx', x)}${$.attr('cy', y)}${$.attr('r', $.store_get($$store_subs ??= {}, '$rippleSize', rippleSize))}${$.attr('opacity', $.store_get($$store_subs ??= {}, '$rippleOpacity', rippleOpacity))} filter="url(#f1)" class="svelte-w37aml"></circle>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}
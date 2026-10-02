import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { tweened } from 'svelte/motion';
import { backOut } from 'svelte/easing';

var root = $.from_svg(`<defs><filter id="f1" x="0" y="0"><feGaussianBlur in="SourceGraphic"></feGaussianBlur></filter></defs><circle filter="url(#f1)" class="svelte-w37aml"></circle>`, 1);

export default function Ripple($$anchor, $$props) {
	$.push($$props, true);

	const $rippleSize = () => $.store_get(rippleSize, '$rippleSize', $$stores);
	const $rippleOpacity = () => $.store_get(rippleOpacity, '$rippleOpacity', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	onMount(() => {
		rippleOpacity.set(0);
		rippleSize.set($$props.size);
	});

	const rippleSize = tweened($$props.sizeIn, { duration: $$props.speed });

	const rippleOpacity = tweened($$props.opacityIn, {
		duration: $$props.speed + $$props.speed * 2.5,
		easing: backOut
	});

	var fragment = root();
	var defs = $.first_child(fragment);
	var filter = $.child(defs);
	var feGaussianBlur = $.only_child(filter);

	$.reset(defs);

	var circle = $.sibling(defs);

	$.template_effect(() => {
		$.set_attribute(feGaussianBlur, 'stdDeviation', $$props.rippleBlur);
		$.set_attribute(circle, 'cx', $$props.x);
		$.set_attribute(circle, 'cy', $$props.y);
		$.set_attribute(circle, 'r', $rippleSize());
		$.set_attribute(circle, 'opacity', $rippleOpacity());
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}
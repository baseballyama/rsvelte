import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';
import { onDestroy } from 'svelte';
import { useAnimation } from './terminal.svelte.js';
import { fly } from 'svelte/transition';
import { box } from 'svelte-toolbelt';

var root = $.from_html(`<span><span class="text-cyan-400"> </span> <!></span>`);
var root_1 = $.from_html(`<span data-completed=""><!></span>`);

export default function Terminal_loading($$anchor, $$props) {
	$.push($$props, true);

	const frames = ['◒', '◐', '◓', '◑'];

	let delay = $.prop($$props, 'delay', 3, 0),
		duration = $.prop($$props, 'duration', 3, 1000);

	let playAnimation = $.state(false);
	let animationSpeed = $.state(1);
	let frameIndex = $.state(0);
	let complete = $.state(false);
	let interval = $.state(void 0);
	let timeout = $.state(void 0);

	const play = (speed) => {
		$.set(playAnimation, true);
		$.set(animationSpeed, speed, true);
		$.set(interval, setInterval(nextFrame, 75 / $.get(animationSpeed)), true);

		$.set(
			timeout,
			setTimeout(
				() => {
					$.set(complete, true);
					animation.onComplete?.();
				},
				duration() / $.get(animationSpeed)
			),
			true
		);
	};

	const nextFrame = () => {
		if ($.get(frameIndex) >= frames.length - 1) {
			$.set(frameIndex, 0);

			return;
		}

		$.update(frameIndex);
	};

	const flyDuration = $.derived(() => 300 / $.get(animationSpeed));
	const animation = useAnimation({ delay: box.with(() => delay()), play });

	onDestroy(() => {
		animation.dispose();
		clearInterval($.get(interval));
		clearTimeout($.get(timeout));
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var span = root();
			var span_1 = $.child(span);
			var text = $.only_child(span_1, true);
			var node_1 = $.sibling(span_1, 2);

			$.snippet(node_1, () => $$props.loadingMessage);
			$.reset(span);

			$.template_effect(
				($0) => {
					$.set_class(span, 1, $0);
					$.set_text(text, frames[$.get(frameIndex)]);
				},
				[() => $.clsx(cn('block', $$props.class))]
			);

			$.transition(1, span, () => fly, () => ({ y: -5, duration: $.get(flyDuration) }));
			$.append($$anchor, span);
		};

		var consequent_1 = ($$anchor) => {
			var span_2 = root_1();
			var node_2 = $.child(span_2);

			$.snippet(node_2, () => $$props.completeMessage);
			$.reset(span_2);
			$.template_effect(($0) => $.set_class(span_2, 1, $0), [() => $.clsx(cn('block', $$props.class))]);
			$.transition(1, span_2, () => fly, () => ({ y: -5, duration: $.get(flyDuration) }));
			$.append($$anchor, span_2);
		};

		$.if(node, ($$render) => {
			if ($.get(playAnimation) && !$.get(complete)) $$render(consequent); else if ($.get(playAnimation)) $$render(consequent_1, 1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}
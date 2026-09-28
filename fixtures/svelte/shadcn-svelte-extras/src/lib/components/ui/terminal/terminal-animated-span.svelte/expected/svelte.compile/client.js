import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';
import { onDestroy } from 'svelte';
import { useAnimation } from './terminal.svelte.js';
import { fly } from 'svelte/transition';
import { box } from 'svelte-toolbelt';

var root = $.from_html(`<span><!></span>`);

export default function Terminal_animated_span($$anchor, $$props) {
	$.push($$props, true);

	let delay = $.prop($$props, 'delay', 3, 0);
	let playAnimation = $.state(false);
	let animationSpeed = $.state(1);
	let completeTimeout = $.state(void 0);

	const play = (speed) => {
		$.set(playAnimation, true);
		$.set(animationSpeed, speed, true);
		$.set(completeTimeout, setTimeout(() => animation.onComplete?.(), $.get(duration)), true);
	};

	const duration = $.derived(() => 300 / $.get(animationSpeed));
	const animation = useAnimation({ delay: box.with(() => delay()), play });

	onDestroy(() => {
		animation.dispose();
		clearTimeout($.get(completeTimeout));
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var span = root();
			var node_1 = $.child(span);

			$.snippet(node_1, () => $$props.children ?? $.noop);
			$.reset(span);
			$.template_effect(($0) => $.set_class(span, 1, $0), [() => $.clsx(cn('block', $$props.class))]);
			$.transition(1, span, () => fly, () => ({ y: -5, duration: $.get(duration) }));
			$.append($$anchor, span);
		};

		$.if(node, ($$render) => {
			if ($.get(playAnimation)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}
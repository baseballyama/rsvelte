import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { cubicInOut } from 'svelte/easing';
import { tweened } from 'svelte/motion';

var root = $.from_html(`<div class="z-notification fixed left-0 right-0 top-0 h-0.5 w-full"><progress max="100" aria-label="page loading indicator" class="invisible"> </progress> <div class="absolute left-0 top-0 h-full bg-orange-500" aria-disabled="true"></div></div>`);

export default function PageLoadIndicator($$anchor, $$props) {
	$.push($$props, true);

	const $p = () => $.store_get(p, '$p', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const p = tweened(0);

	onMount(() => {
		p.set(1, {
			duration: 8000,
			easing(t) {
				const steps = [0, 0.2, 0.6, 0.75, 1];

				for (let i = 0; i < steps.length; i++) {
					if (t < steps[i]) {
						const stepDuration = steps[i] - steps[i - 1];

						return cubicInOut((t - steps[i - 1]) / stepDuration) * stepDuration + steps[i - 1];
					}
				}

				return 1;
			}
		});
	});

	var div = root();
	var progress = $.child(div);
	var text = $.only_child(progress);
	var div_1 = $.sibling(progress, 2);

	$.set_style(div_1, '', {}, { width: 'var(--percentage)' });
	$.reset(div);

	$.template_effect(() => {
		$.set_style(div, `--percentage: ${$p() * 100}%`);
		$.set_value(progress, $p() * 100);
		$.set_text(text, `${$p() ?? ''}%`);
	});

	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}
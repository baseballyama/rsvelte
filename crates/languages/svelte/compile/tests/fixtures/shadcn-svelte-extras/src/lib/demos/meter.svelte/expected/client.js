import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Meter } from '$lib/components/ui/meter';
import { cn } from '$lib/utils.js';
import { onMount } from 'svelte';
import { linear } from 'svelte/easing';
import { Tween } from 'svelte/motion';

var root = $.from_html(`<div class="w-[200px]"><div class="flex place-items-center justify-between text-sm"><span>Tokens</span> <span> </span></div> <!></div>`);

export default function Meter_1($$anchor, $$props) {
	$.push($$props, true);

	const LIMIT = 100;
	const usage = new Tween(0, { duration: 2500, easing: linear });

	onMount(() => {
		setTimeout(
			() => {
				usage.set(100);
			},
			500
		);
	});

	var div = root();
	var div_1 = $.child(div);
	var span = $.sibling($.child(div_1), 2);
	var text = $.only_child(span);

	$.reset(div_1);

	var node = $.sibling(div_1, 2);

	{
		let $0 = $.derived(() => cn('--meter-background:(var(--color-blue-500)) [&_div]:transition-colors [&_div]:transition-none', {
			'[--meter-background:var(--destructive)]!': usage.current === LIMIT,
			'[--meter-background:var(--color-orange-400)]': usage.current > LIMIT * 0.75
		}));

		Meter(node, {
			get class() {
				return $.get($0);
			},

			get value() {
				return usage.current;
			},
			max: LIMIT
		});
	}

	$.reset(div);
	$.template_effect(($0) => $.set_text(text, `${$0 ?? ''}/100`), [() => usage.current.toFixed(0)]);
	$.append($$anchor, div);
	$.pop();
}
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tv } from 'tailwind-variants';
import { usePasswordStrength } from './password.svelte.js';
import { Meter } from 'bits-ui';
import { cn } from '$lib/utils.js';
import { box } from 'svelte-toolbelt';

var root = $.from_html(`<div class="ring-background h-[6px] w-1/4 rounded-full ring-3"></div>`);
var root_1 = $.from_html(`<div></div> <div class="absolute top-0 left-0 z-10 flex h-[6px] w-full place-items-center gap-1"></div>`, 1);

export default function Password_strength($$anchor, $$props) {
	$.push($$props, true);

	let strength = $.prop($$props, 'strength', 15);

	usePasswordStrength({ strength: box.with(() => strength(), (v) => strength(v)) });

	const score = $.derived(() => strength()?.score ?? 0);

	const color = tv({
		base: '',
		variants: {
			score: {
				0: 'bg-red-500',
				1: 'bg-red-500',
				2: 'bg-yellow-500',
				3: 'bg-yellow-500',
				4: 'bg-green-500'
			}
		}
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn('bg-accent relative h-[6px] w-full gap-1 overflow-hidden rounded-full', $$props.class));

		$.component(node, () => Meter.Root, ($$anchor, Meter_Root) => {
			Meter_Root($$anchor, {
				get value() {
					return $.get(score);
				},

				get class() {
					return $.get($0);
				},
				min: 0,
				max: 4,
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root_1();
					var div = $.first_child(fragment_1);
					var div_1 = $.sibling(div, 2);

					$.each(div_1, 20, () => Array.from({ length: 4 }), $.index, ($$anchor, _) => {
						var div_2 = root();

						$.append($$anchor, div_2);
					});

					$.reset(div_1);

					$.template_effect(
						($0) => {
							$.set_class(div, 1, $0);
							$.set_style(div, `width: ${$.get(score) / 4 * 100}%;`);
						},
						[
							() => $.clsx(cn('h-full transition-all duration-500', color({ score: $.get(score) })))
						]
					);

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}
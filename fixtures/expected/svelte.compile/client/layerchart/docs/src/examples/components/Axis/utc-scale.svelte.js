import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Axis, Chart, Layer } from 'layerchart';
import { scaleUtc } from 'd3-scale';
import { utcDay } from 'd3-time';

var root = $.from_html(`<div class="grid gap-4"><div><div class="text-sm font-semibold">UTC</div> <div class="text-xs text-surface-content/50">\`scaleUtc()\` floors and labels ticks on UTC boundaries, matching the data.</div> <!></div> <div><div class="text-sm font-semibold">Local time</div> <div class="text-xs text-surface-content/50">The default \`scaleTime()\` floors on local boundaries, so over the same domain its ticks sit
			one UTC offset away from each UTC day.</div> <!></div></div>`);

export default function Utc_scale($$anchor, $$props) {
	$.push($$props, true);

	// A domain on UTC day boundaries — typical of values keyed on a UTC calendar date
	// (ex. daily partitions) rather than on an instant.
	const start = utcDay.floor(new Date());

	const xDomain = [start, utcDay.offset(start, 7)];
	var div = root();
	var div_1 = $.child(div);
	var node = $.sibling($.child(div_1), 4);

	{
		let $0 = $.derived(scaleUtc);

		Chart(node, {
			get xScale() {
				return $.get($0);
			},

			get xDomain() {
				return xDomain;
			},
			padding: 24,
			height: 48,
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						Axis($$anchor, {
							placement: 'bottom',
							format: { type: 'day', options: { variant: 'short' } },
							rule: true
						});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_1 = $.sibling($.child(div_2), 4);

	Chart(node_1, {
		get xDomain() {
			return xDomain;
		},
		padding: 24,
		height: 48,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					Axis($$anchor, {
						placement: 'bottom',
						format: { type: 'day', options: { variant: 'short' } },
						rule: true
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_2);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ArcChart } from 'layerchart';
import ShowControl from '$lib/components/controls/fields/ShowField.svelte';

var root = $.from_html(`<!> <div><!></div>`, 1);

export default function Series_motion_tween($$anchor, $$props) {
	$.push($$props, true);

	const data = [
		{ key: 'move', value: 400, maxValue: 1000, color: '#ef4444' },
		{ key: 'exercise', value: 20, maxValue: 30, color: '#a3e635' },
		{ key: 'stand', value: 10, maxValue: 12, color: '#22d3ee' }
	];

	let show = $.state(void 0);
	var $$exports = { data };
	var fragment = root();
	var node = $.first_child(fragment);

	ShowControl(node, {
		label: 'Show Arcs',
		get show() {
			return $.get(show);
		},

		set show($$value) {
			$.set(show, $$value, true);
		}
	});

	var div = $.sibling(node, 2);

	$.set_style(div, '', {}, { height: '180px' });

	var node_1 = $.child(div);

	{
		var consequent = ($$anchor) => {
			{
				let $0 = $.derived(() => data.map((d) => {
					return { key: d.key, data: [d], maxValue: d.maxValue, color: d.color };
				}));

				ArcChart($$anchor, {
					key: 'key',
					value: 'value',
					get series() {
						return $.get($0);
					},
					props: { arc: { motion: 'tween' } },
					outerRadius: -25,
					innerRadius: -20,
					cornerRadius: 10,
					height: 180
				});
			}
		};

		$.if(node_1, ($$render) => {
			if ($.get(show)) $$render(consequent);
		});
	}

	$.reset(div);
	$.append($$anchor, fragment);

	return $.pop($$exports);
}
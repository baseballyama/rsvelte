import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LineChart, defaultChartPadding } from 'layerchart';
import { ticks } from 'd3-array';

var root = $.from_html(`<div><!></div>`);

export default function Dynamic_data($$anchor, $$props) {
	$.push($$props, true);

	let data = $.state($.proxy(ticks(-2, 2, 200).map(Math.sin)));

	var $$exports = {
		get data() {
			return $.get(data);
		},

		set data($$value) {
			$.set(data, $.proxy($$value));
		}
	};

	var div = root();
	var node = $.child(div);

	{
		let $0 = $.derived(() => $.get(data).map((d, i) => ({ x: i, y: d })));
		let $1 = $.derived(() => defaultChartPadding({ right: 10 }));

		LineChart(node, {
			get data() {
				return $.get($0);
			},
			x: 'x',
			y: 'y',
			yBaseline: undefined,
			tooltipContext: false,
			motion: { type: 'spring' },
			props: {},
			get padding() {
				return $.get($1);
			},
			height: 300
		});
	}

	$.reset(div);

	$.delegated('mousemove', div, (e) => {
		const x = e.clientX;
		const y = e.clientY;

		$.set(data, $.get(data).slice(-200).concat(Math.atan2(x, y)), true);
	});

	$.append($$anchor, div);

	return $.pop($$exports);
}

$.delegate(['mousemove']);
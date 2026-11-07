import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LineChart } from 'layerchart';
import { format } from '@layerstack/utils';
import { Button, ButtonGroup } from 'svelte-ux';
import { createDateSeries } from '$lib/utils/data.js';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="grid gap-2"><div class="flex items-center gap-2"><!> <!></div> <div class="text-sm text-surface-content/70" aria-live="polite"> </div> <!></div>`);

export default function Programmatic_control($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({ count: 30, min: 400, max: 900, value: 'integer' });
	let context = $.state(void 0);
	const dates = data.map((d) => d.date);
	const tooltipData = $.derived(() => $.get(context)?.tooltip.data);

	const activeIndex = $.derived(() => $.get(tooltipData)
		? dates.findIndex((d) => +d === +$.get(tooltipData).date)
		: -1);

	function step(delta) {
		// start at the beginning when nothing is shown
		const next = $.get(activeIndex) === -1 ? 0 : $.get(activeIndex) + delta;

		if (next < 0 || next >= dates.length) return;

		// `show({ value })` resolves the nearest point to a domain value, so anything that knows an
		// `x` can drive the tooltip — a button, a keypress, a selection made elsewhere
		$.get(context)?.tooltip.show({ value: { x: dates[next] } });
	}

	// Built as a single string so the announced text has real separators — CSS margin between
	// elements is invisible to a screen reader
	const statusText = $.derived(() => $.get(activeIndex) >= 0
		? `${format(dates[$.get(activeIndex)], 'day')} — ${data[$.get(activeIndex)].value}`
		: 'No day selected');

	function onkeydown(e) {
		// don't hijack keys while the user is typing elsewhere on the page
		const target = e.target;

		if (target?.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName ?? '')) return;

		const actions = {
			ArrowRight: () => step(1),
			ArrowLeft: () => step(-1),
			Escape: () => $.get(context)?.tooltip.hide()
		};

		const action = actions[e.key];

		if (action) {
			e.preventDefault();
			action();
		}
	}

	var $$exports = { data };
	var div = root_1();

	$.event('keydown', $.window, onkeydown);

	var div_1 = $.child(div);
	var node = $.child(div_1);

	ButtonGroup(node, {
		variant: 'fill-light',
		size: 'sm',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			Button(node_1, {
				onclick: () => step(-1),
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('← Prev');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Button(node_2, {
				onclick: () => step(1),
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Next →');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node, 2);

	Button(node_3, {
		variant: 'fill-light',
		size: 'sm',
		onclick: () => $.get(context)?.tooltip.hide(),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Clear');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var text_3 = $.only_child(div_2, true);
	var node_4 = $.sibling(div_2, 2);

	LineChart(node_4, {
		get data() {
			return data;
		},
		x: 'date',
		y: 'value',
		height: 200,
		padding: { left: 40, bottom: 20 },
		get context() {
			return $.get(context);
		},

		set context($$value) {
			$.set(context, $$value, true);
		}
	});

	$.reset(div);
	$.template_effect(() => $.set_text(text_3, $.get(statusText)));
	$.append($$anchor, div);

	return $.pop($$exports);
}
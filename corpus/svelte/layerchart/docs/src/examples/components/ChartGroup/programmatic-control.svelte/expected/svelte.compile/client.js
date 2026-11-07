import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ChartGroupState, LineChart } from 'layerchart';
import { format } from '@layerstack/utils';
import { Button, ButtonGroup } from 'svelte-ux';
import { createDateSeries } from '$lib/utils/data.js';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="border rounded-sm p-2"><div class="text-sm text-surface-content/70"> </div> <!></div>`);
var root_2 = $.from_html(`<div class="grid gap-2"><div class="flex items-center gap-2"><!> <!></div> <div class="text-sm text-surface-content/70" aria-live="polite"> </div> <!></div>`);

export default function Programmatic_control($$anchor, $$props) {
	$.push($$props, true);

	const panels = [
		{
			key: 'requests',
			label: 'Requests',
			data: createDateSeries({ count: 30, min: 400, max: 900, value: 'integer' }),
			color: 'var(--color-info-500)'
		},

		{
			key: 'errors',
			label: 'Errors',
			data: createDateSeries({ count: 30, min: 0, max: 30, value: 'integer' }),
			color: 'var(--color-danger-500)'
		}
	];

	const group = new ChartGroupState();

	// The shared timeline every chart is indexed against
	const dates = panels[0].data.map((d) => d.date);

	const activeIndex = $.derived(() => group.pointer.active ? dates.findIndex((d) => +d === +group.pointer.x) : -1);

	function step(delta) {
		// start at the beginning when nothing is selected
		const next = $.get(activeIndex) === -1 ? 0 : $.get(activeIndex) + delta;

		if (next < 0 || next >= dates.length) return;

		group.setPointer({ x: dates[next] });
	}

	// Built as a single string so the announced text has real separators — CSS margin between
	// elements is invisible to a screen reader, which would read "627Errors: 30"
	const statusText = $.derived(() => $.get(activeIndex) >= 0
		? `${format(dates[$.get(activeIndex)], 'day')} — ` + panels.map((p) => `${p.label}: ${p.data[$.get(activeIndex)]?.value}`).join(', ')
		: 'No day selected');

	function onkeydown(e) {
		// don't hijack keys while the user is typing elsewhere on the page
		const target = e.target;

		if (target?.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName ?? '')) return;

		const actions = {
			ArrowRight: () => step(1),
			ArrowLeft: () => step(-1),
			Escape: () => group.clearPointer()
		};

		const action = actions[e.key];

		if (action) {
			e.preventDefault();
			action();
		}
	}

	const data = panels;
	var $$exports = { data };
	var div = root_2();

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
		onclick: () => group.clearPointer(),
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

	$.each(node_4, 17, () => panels, (panel) => panel.key, ($$anchor, panel) => {
		var div_3 = root_1();
		var div_4 = $.child(div_3);
		var text_4 = $.only_child(div_4, true);
		var node_5 = $.sibling(div_4, 2);

		{
			let $0 = $.derived(() => [
				{
					key: 'value',
					label: $.get(panel).label,
					color: $.get(panel).color
				}
			]);

			LineChart(node_5, {
				get data() {
					return $.get(panel).data;
				},
				x: 'date',
				y: 'value',
				get series() {
					return $.get($0);
				},

				get group() {
					return group;
				},
				height: 100,
				padding: { left: 40, bottom: 20 }
			});
		}

		$.reset(div_3);
		$.template_effect(() => $.set_text(text_4, $.get(panel).label));
		$.append($$anchor, div_3);
	});

	$.reset(div);
	$.template_effect(() => $.set_text(text_3, $.get(statusText)));
	$.append($$anchor, div);

	return $.pop($$exports);
}
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LineChart, defaultChartPadding } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

var root = $.from_html(`<div class="text-center pb-4 text-sm">Select desired series on the legend, reload the page, and they will persist.</div> <!>`, 1);

export default function Persist_series($$anchor, $$props) {
	$.push($$props, true);

	const STORAGE_KEY = 'layerchart:persist-series:selected-keys';

	const data = createDateSeries({
		count: 30,
		min: 10,
		max: 100,
		value: 'integer',
		keys: ['apples', 'bananas', 'oranges']
	});

	let context = $.state(void 0);
	let loaded = false;

	// load once when context is ready
	$.user_effect(() => {
		if (!$.get(context)?.isMounted) return;

		const saved = localStorage.getItem(STORAGE_KEY);

		if (saved) {
			const keys = JSON.parse(saved);

			if (Array.isArray(keys)) {
				$.get(context).series.selectedKeys.current = keys;
			}
		}

		loaded = true;
	});

	// save whenever selected keys change (after initial load)
	$.user_effect(() => {
		const keys = $.get(context)?.series?.selectedKeys?.current;

		if (loaded && keys) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
		}
	});

	var $$exports = { data };
	var fragment = root();
	var node = $.sibling($.first_child(fragment), 2);

	{
		let $0 = $.derived(() => defaultChartPadding({ legend: true, right: 10 }));

		LineChart(node, {
			get data() {
				return data;
			},
			x: 'date',
			series: [
				{ key: 'apples', color: 'var(--color-apples)' },
				{ key: 'bananas', color: 'var(--color-bananas)' },
				{ key: 'oranges', color: 'var(--color-oranges)' }
			],

			get padding() {
				return $.get($0);
			},
			height: 300,
			legend: true,
			get context() {
				return $.get(context);
			},

			set context($$value) {
				$.set(context, $$value, true);
			}
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}
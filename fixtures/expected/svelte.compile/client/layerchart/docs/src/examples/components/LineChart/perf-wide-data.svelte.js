import 'svelte/internal/disclose-version';
import { getWideData } from '$lib/data.remote.js';
import * as $ from 'svelte/internal/client';
import { LineChart } from 'layerchart';
import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';
import { format } from '@layerstack/utils';
import { Blockquote } from '@layerstack/docs/markdown/components';

const data = await getWideData();
var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="h-[500px] p-4 border rounded-sm"><!></div>`);
var root_2 = $.from_html(`<div class="grid gap-4"><div class="flex gap-3"><!> <!></div> <!> <div><!></div> <!></div>`);

export default function Perf_wide_data($$anchor, $$props) {
	$.push($$props, true);

	let example = $.state('single');
	let motion = $.state(true);
	let show = $.state(true);

	let chartProps = $.derived(() => ({
		xAxis: { format: (v) => format(new Date(v * 60 * 1000)) },
		tooltip: {
			root: { motion: $.get(motion) ? 'spring' : 'none' },
			header: { format: (v) => format(new Date(v * 60 * 1000)) }
		},
		highlight: { motion: $.get(motion) ? 'spring' : 'none' }
	}));

	var div = root_2();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Field(node, {
		label: 'Motion',
		children: ($$anchor, $$slotProps) => {
			ToggleGroup($$anchor, {
				variant: 'outline',
				get value() {
					return $.get(motion);
				},

				set value($$value) {
					$.set(motion, $$value, true);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_1 = $.first_child(fragment_1);

					ToggleOption(node_1, {
						value: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Yes');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					ToggleOption(node_2, {
						value: false,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('No');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node, 2);

	Field(node_3, {
		label: 'Show',
		children: ($$anchor, $$slotProps) => {
			ToggleGroup($$anchor, {
				variant: 'outline',
				get value() {
					return $.get(show);
				},

				set value($$value) {
					$.set(show, $$value, true);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root();
					var node_4 = $.first_child(fragment_3);

					ToggleOption(node_4, {
						value: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Yes');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					ToggleOption(node_5, {
						value: false,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('No');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var node_6 = $.sibling(div_1, 2);

	ToggleGroup(node_6, {
		variant: 'underline',
		classes: { options: 'justify-start h-10' },
		get value() {
			return $.get(example);
		},

		set value($$value) {
			$.set(example, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_4 = root();
			var node_7 = $.first_child(fragment_4);

			ToggleOption(node_7, {
				value: 'single',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Single');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_7, 2);

			ToggleOption(node_8, {
				value: 'series',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('Series');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	var div_2 = $.sibling(node_6, 2);
	var node_9 = $.child(div_2);

	$.key(node_9, () => $.get(chartProps), ($$anchor) => {
		var fragment_5 = $.comment();
		var node_10 = $.first_child(fragment_5);

		{
			var consequent_1 = ($$anchor) => {
				var div_3 = root_1();
				var node_11 = $.child(div_3);

				{
					var consequent = ($$anchor) => {
						LineChart($$anchor, {
							get data() {
								return data;
							},
							x: 'epoch',
							y: (d) => 100 - d.idl,
							get props() {
								return $.get(chartProps);
							},
							brush: true,
							profile: true
						});
					};

					$.if(node_11, ($$render) => {
						if ($.get(show)) $$render(consequent);
					});
				}

				$.reset(div_3);
				$.append($$anchor, div_3);
			};

			var consequent_3 = ($$anchor) => {
				var div_4 = root_1();
				var node_12 = $.child(div_4);

				{
					var consequent_2 = ($$anchor) => {
						LineChart($$anchor, {
							get data() {
								return data;
							},
							x: 'epoch',
							series: [
								{
									key: 'cpu',
									value: (d) => 100 - d.idl,
									color: 'var(--color-danger)'
								},

								{
									key: 'ram',
									value: (d) => 100 * d.writ / (d.writ + d.used),
									color: 'var(--color-warning)'
								},

								{
									key: 'tcp',
									value: (d) => d.send,
									color: 'var(--color-success)'
								}
							],

							get props() {
								return $.get(chartProps);
							},
							brush: true,
							profile: true
						});
					};

					$.if(node_12, ($$render) => {
						if ($.get(show)) $$render(consequent_2);
					});
				}

				$.reset(div_4);
				$.append($$anchor, div_4);
			};

			$.if(node_10, ($$render) => {
				if ($.get(example) === 'single') $$render(consequent_1); else if ($.get(example) === 'series') $$render(consequent_3, 1);
			});
		}

		$.append($$anchor, fragment_5);
	});

	$.reset(div_2);

	var node_13 = $.sibling(div_2, 2);

	Blockquote(node_13, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_6 = $.text();

			$.template_effect(($0) => $.set_text(text_6, `Individual arrays per dimension, similar to uplot. ${$0 ?? ''} data points`), [() => format(data.length)]);
			$.append($$anchor, text_6);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}
import 'svelte/internal/disclose-version';
import { getCategoryBrands } from '$lib/data.remote.js';
import * as $ from 'svelte/internal/client';
import { Axis, Chart, Group, Image, Layer, Rect, Text } from 'layerchart';
import { Button, RangeField } from 'svelte-ux';
import LucidePlay from '~icons/lucide/play';
import LucidePause from '~icons/lucide/pause';
import { schemeTableau10 } from 'd3-scale-chromatic';
import { pairs, rollup, ascending, max, rank } from 'd3-array';
import { sortFunc } from '@layerstack/utils';

const allData = await getCategoryBrands();
var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="grid grid-cols-[100px_1fr] items-center gap-3 mb-2"><!> <!></div> <!>`, 1);

export default function Company_race($$anchor, $$props) {
	$.push($$props, true);

	const n = 12;
	const k = 10;
	const duration = 250;
	const barSize = 32;
	const barGap = 6;
	const topPadding = 20;
	const chartHeight = topPadding + (barSize + barGap) * n - barGap + 20;
	const tweenMotion = { type: 'tween', duration, easing: (t) => t };

	function toIconName(name) {
		return name.toLowerCase().replace(/-benz/g, '').replace(/[''.é]/g, '').replace(/[\s\-/&]+/g, '');
	}

	// Brands not available in simple-icons
	const missingIcons = new Set([
		'ge',
		'disney',
		'att',
		'marlboro',
		'citi',
		'gillette',
		'compaq',
		'nescaf',
		'heinz',
		'budweiser',
		'xerox',
		'gap',
		'philips',
		'canon',
		'louisvuitton',
		'hm'
	]);

	function logoUrl(name) {
		const icon = toIconName(name);

		if (missingIcons.has(icon)) return undefined;

		return `https://api.iconify.design/simple-icons/${icon}.svg?color=%23888`;
	}

	const logoSize = 20;

	// Category lookup for enriching frame items
	const categoryByName = $.derived(() => new Map(allData.map((d) => [d.name, d.category])));

	// Build datevalues: [date, Map<name, value>][]
	const datevalues = $.derived(() => Array.from(rollup(allData, ([d]) => d.value, (d) => +d.date, (d) => d.name)).map(([date, data]) => [new Date(date), data]).sort(([a], [b]) => ascending(+a, +b)));

	const names = $.derived(() => new Set(allData.map((d) => d.name)));

	function computeRanked(allNames, valueFn) {
		const data = Array.from(allNames, (name) => ({
			name,
			value: valueFn(name),
			category: $.get(categoryByName).get(name) ?? ''
		}));

		const ranks = rank(data, sortFunc('value', 'desc'));

		return data.map((d, i) => ({ ...d, rank: ranks[i] }));
	}

	// Generate interpolated keyframes (k intermediate frames per year)
	const keyframes = $.derived(() => {
		if (!$.get(datevalues).length) return [];

		const frames = [];

		for (const [[ka, a], [kb, b]] of pairs($.get(datevalues))) {
			for (let i = 0; i < k; i++) {
				const t = i / k;

				frames.push({
					date: new Date(+ka * (1 - t) + +kb * t),
					data: computeRanked($.get(names), (name) => (a.get(name) || 0) * (1 - t) + (b.get(name) || 0) * t)
				});
			}
		}

		const lastDv = $.get(datevalues)[$.get(datevalues).length - 1];

		frames.push({
			date: lastDv[0],
			data: computeRanked($.get(names), (name) => lastDv[1].get(name) || 0)
		});

		// Collect all brand names that ever appear in top n
		const namesInChart = [
			...new Set(frames.flatMap((f) => f.data.filter((d) => d.rank < n).map((d) => d.name)))
		];

		// Normalize: every frame has same brands in same fixed order
		return frames.map((f) => {
			const dataMap = new Map(f.data.map((d) => [d.name, d]));

			return {
				date: f.date,
				data: namesInChart.map((name) => dataMap.get(name))
			};
		});
	});

	let frameIndex = $.state(0);
	let isPlaying = $.state(false);
	const currentFrame = $.derived(() => $.get(keyframes)[$.get(frameIndex)]);
	const currentData = $.derived(() => $.get(currentFrame)?.data ?? []);
	const currentMax = $.derived(() => max($.get(currentData), (d) => d.value) ?? 1);
	const xDomain = $.derived(() => [0, $.get(currentMax)]);
	const currentDate = $.derived(() => $.get(currentFrame)?.date);

	$.user_effect(() => {
		if (!$.get(isPlaying) || !$.get(keyframes).length) return;

		const id = setInterval(
			() => {
				if ($.get(frameIndex) < $.get(keyframes).length - 1) {
					$.update(frameIndex);
				} else {
					$.set(isPlaying, false);
				}
			},
			duration
		);

		return () => clearInterval(id);
	});

	function togglePlay() {
		if ($.get(isPlaying)) {
			$.set(isPlaying, false);
		} else {
			if ($.get(frameIndex) >= $.get(keyframes).length - 1) $.set(frameIndex, 0);

			$.set(isPlaying, true);
		}
	}

	const yPos = (rank) => barGap + rank * (barSize + barGap);
	var $$exports = { data: allData };
	var fragment = root_2();
	var div = $.first_child(fragment);
	var node = $.child(div);

	$.key(node, () => $.get(isPlaying), ($$anchor) => {
		{
			let $0 = $.derived(() => $.get(isPlaying) ? LucidePause : LucidePlay);

			Button($$anchor, {
				get icon() {
					return $.get($0);
				},
				variant: 'outline',
				size: 'sm',
				$$events: { click: togglePlay },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text();

					$.template_effect(() => $.set_text(text, $.get(isPlaying) ? 'Pause' : 'Play'));
					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		}
	});

	var node_1 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => String($.get(currentDate)?.getFullYear() ?? ''));
		let $1 = $.derived(() => Math.max(0, $.get(keyframes).length - 1));

		RangeField(node_1, {
			get label() {
				return $.get($0);
			},
			min: 0,
			get max() {
				return $.get($1);
			},
			class: 'flex-1',
			get value() {
				return $.get(frameIndex);
			},

			set value($$value) {
				$.set(frameIndex, $$value, true);
			}
		});
	}

	$.reset(div);

	var node_2 = $.sibling(div, 2);

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;

			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_1();
					var node_3 = $.first_child(fragment_4);

					$.each(node_3, 17, () => $.get(currentData), (d) => d.name, ($$anchor, d) => {
						const barWidth = $.derived(() => Math.max(0, context().xScale($.get(d).value)));
						const visible = $.derived(() => $.get(d).rank < n);
						const logo = $.derived(() => logoUrl($.get(d).name));

						{
							let $0 = $.derived(() => yPos($.get(d).rank));
							let $1 = $.derived(() => $.get(visible) ? 0.8 : 0);

							Group($$anchor, {
								x: 0,
								get y() {
									return $.get($0);
								},

								get opacity() {
									return $.get($1);
								},

								get motion() {
									return tweenMotion;
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_6 = root();
									var node_4 = $.first_child(fragment_6);

									{
										let $0 = $.derived(() => context().cGet($.get(d)));
										let $1 = $.derived(() => ({ width: tweenMotion }));

										Rect(node_4, {
											x: 0,
											y: 0,
											get width() {
												return $.get(barWidth);
											},
											height: barSize,
											get fill() {
												return $.get($0);
											},
											rx: 2,
											get motion() {
												return $.get($1);
											}
										});
									}

									var node_5 = $.sibling(node_4, 2);

									{
										var consequent = ($$anchor) => {
											{
												let $0 = $.derived(() => $.get(barWidth) + logoSize / 2 + 4);
												let $1 = $.derived(() => ({ x: tweenMotion }));

												Image($$anchor, {
													get href() {
														return $.get(logo);
													},

													get x() {
														return $.get($0);
													},
													y: barSize / 2,
													width: logoSize,
													height: logoSize,
													preserveAspectRatio: 'xMidYMid meet',
													get motion() {
														return $.get($1);
													}
												});
											}
										};

										$.if(node_5, ($$render) => {
											if ($.get(logo)) $$render(consequent);
										});
									}

									var node_6 = $.sibling(node_5, 2);

									{
										let $0 = $.derived(() => $.get(barWidth) - 6);

										Text(node_6, {
											get x() {
												return $.get($0);
											},
											y: barSize / 2 - 6,
											textAnchor: 'end',
											verticalAnchor: 'middle',
											get value() {
												return $.get(d).name;
											},
											class: 'text-xs font-semibold fill-white text-shadow-md',
											get motion() {
												return tweenMotion;
											}
										});
									}

									var node_7 = $.sibling(node_6, 2);

									{
										let $0 = $.derived(() => $.get(barWidth) - 6);

										Text(node_7, {
											get x() {
												return $.get($0);
											},
											y: barSize / 2 + 7,
											textAnchor: 'end',
											verticalAnchor: 'middle',
											get value() {
												return $.get(d).value;
											},
											format: 'integer',
											class: 'text-[10px] fill-white/70 tabular-nums text-shadow-md',
											get motion() {
												return tweenMotion;
											}
										});
									}

									$.append($$anchor, fragment_6);
								},
								$$slots: { default: true }
							});
						}
					});

					var node_8 = $.sibling(node_3, 2);

					Axis(node_8, {
						placement: 'top',
						grid: { class: 'stroke-surface-content/10' },
						format: 'metric',
						tickSpacing: 100,
						get motion() {
							return tweenMotion;
						}
					});

					var node_9 = $.sibling(node_8, 2);

					{
						let $0 = $.derived(() => String($.get(currentDate)?.getFullYear() ?? ''));

						Text(node_9, {
							get x() {
								return context().xRange[1];
							},
							y: chartHeight - 40,
							textAnchor: 'end',
							get value() {
								return $.get($0);
							},
							class: 'text-6xl font-bold tabular-nums fill-surface-content/10'
						});
					}

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});
		};

		Chart(node_2, {
			get data() {
				return $.get(currentData);
			},
			x: 'value',
			get xDomain() {
				return $.get(xDomain);
			},
			c: 'category',
			get cRange() {
				return schemeTableau10;
			},
			padding: { left: 0, right: 80, top: 20, bottom: 0 },
			height: chartHeight,
			children,
			$$slots: { default: true }
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}
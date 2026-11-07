import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cubicOut } from 'svelte/easing';
import { scaleSqrt } from 'd3-scale';
import { Chart, Image, Text, Axis, Highlight, Layer, Tooltip } from 'layerchart';
import { delay } from '@layerstack/utils';
import LucidePlay from '~icons/lucide/play';
import LucideSquare from '~icons/lucide/square';

var root = $.from_svg(`<line stroke="currentColor" stroke-opacity="0.1" stroke-dasharray="4 3" stroke-width="0.5"></line><!><!>`, 1);
var root_1 = $.from_svg(`<!><!><!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div class="flex items-center gap-2 mb-2 text-sm"><button class="px-3 py-1 rounded border border-surface-content/20 hover:bg-surface-content/5">Inner Planets</button> <button class="px-3 py-1 rounded border border-surface-content/20 hover:bg-surface-content/5">Mid System</button> <button class="px-3 py-1 rounded border border-surface-content/20 hover:bg-surface-content/5">Show All</button> <div class="ml-auto flex items-center gap-2"><button class="px-3 py-1 rounded border border-pink-500/50 text-pink-500 hover:bg-pink-500/10 inline-flex items-center gap-1"><!> Scale</button> <button class="px-3 py-1 rounded border border-pink-500/50 text-pink-500 hover:bg-pink-500/10 inline-flex items-center gap-1"><!> Translate</button></div></div> <!>`, 1);

export default function Planet_distances($$anchor, $$props) {
	$.push($$props, true);

	const planets = [
		{
			name: 'Sun',
			distance: 0,
			radius: 695_000,
			image: 'https://space-facts.com/wp-content/uploads/sun-transparent.png'
		},

		{
			name: 'Mercury',
			distance: 58_000_000,
			radius: 2_440,
			image: 'https://space-facts.com/wp-content/uploads/mercury-transparent.png'
		},

		{
			name: 'Venus',
			distance: 108_000_000,
			radius: 6_052,
			image: 'https://space-facts.com/wp-content/uploads/venus-transparent.png'
		},

		{
			name: 'Earth',
			distance: 150_000_000,
			radius: 6_378,
			image: 'https://space-facts.com/wp-content/uploads/earth-transparent.png'
		},

		{
			name: 'Mars',
			distance: 228_000_000,
			radius: 3_397,
			image: 'https://space-facts.com/wp-content/uploads/mars-transparent.png'
		},

		{
			name: 'Jupiter',
			distance: 778_000_000,
			radius: 71_492,
			image: 'https://space-facts.com/wp-content/uploads/jupiter-transparent.png'
		},

		{
			name: 'Saturn',
			distance: 1_429_000_000,
			radius: 60_268,
			image: 'https://space-facts.com/wp-content/uploads/saturn-transparent.png'
		},

		{
			name: 'Uranus',
			distance: 2_871_000_000,
			radius: 25_559,
			image: 'https://space-facts.com/wp-content/uploads/uranus-transparent.png'
		},

		{
			name: 'Neptune',
			distance: 4_504_000_000,
			radius: 24_766,
			image: 'https://space-facts.com/wp-content/uploads/neptune-transparent.png'
		},

		{
			name: 'Pluto',
			distance: 5_913_000_000,
			radius: 1_150,
			image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Pluto_in_True_Color_-_High-Res.png/250px-Pluto_in_True_Color_-_High-Res.png'
		}
	];

	// Local sqrt scale for planet radii (not on Chart, to avoid bind:context cycle)
	const rScale = scaleSqrt().domain([0, Math.max(...planets.map((p) => p.radius))]).range([2, 25]);

	// Smallest consecutive distance gap (Mercury–Venus: 50M km)
	const minDataGap = planets.reduce(
		(min, p, i) => i === 0
			? min
			: Math.min(min, p.distance - planets[i - 1].distance),
		Infinity
	);

	const maxDistance = planets[planets.length - 1].distance;
	const mercuryDistance = planets[1].distance;
	const maxZoomScale = maxDistance / (mercuryDistance * 1.05);
	let context = $.state(null);
	let playingAnimation = $.state(null);

	function formatDistance(d) {
		if (d === 0) return '0';
		if (d >= 1e9) return `${(d / 1e9).toFixed(1)}B km`;

		return `${Math.round(d / 1e6)}M km`;
	}

	let cancelPlaying = null;

	function stopPlaying() {
		cancelPlaying?.();
		cancelPlaying = null;
		$.set(playingAnimation, null);
	}

	async function play(name, steps) {
		stopPlaying();

		let cancelled = false;

		cancelPlaying = () => cancelled = true;
		$.set(playingAnimation, name, true);

		let result = steps.next();

		while (!result.done) {
			if (cancelled) return;

			await delay(result.value);

			if (cancelled) return;

			result = steps.next();
		}

		$.get(context).transform.reset();
		cancelPlaying = null;
		$.set(playingAnimation, null);
	}

	function zoomToDistance(distance) {
		$.get(context).transform.setTranslate({ x: 0, y: 0 });
		$.get(context).transform.setScale(maxDistance / (distance * 1.05));
	}

	function centerOnPlanet(distance) {
		const scale = maxZoomScale;
		const tx = (0.5 - distance * scale / maxDistance) * $.get(context).width;

		$.get(context).transform.setScale(scale);
		$.get(context).transform.setTranslate({ x: tx, y: 0 });
	}

	function* scaleSteps() {
		for (const planet of planets.slice(1)) {
			zoomToDistance(planet.distance);
			yield 2000;
		}
	}

	function* translateSteps() {
		for (const planet of planets) {
			centerOnPlanet(planet.distance);
			yield 3000;
		}
	}

	var $$exports = { data: planets };
	var fragment = root_3();
	var div = $.first_child(fragment);
	var button = $.child(div);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var div_1 = $.sibling(button_2, 2);
	var button_3 = $.child(div_1);
	var node = $.child(button_3);

	{
		var consequent = ($$anchor) => {
			LucideSquare($$anchor, { class: 'size-3' });
		};

		var alternate = ($$anchor) => {
			LucidePlay($$anchor, { class: 'size-3' });
		};

		$.if(node, ($$render) => {
			if ($.get(playingAnimation) === 'scale') $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.next();
	$.reset(button_3);

	var button_4 = $.sibling(button_3, 2);
	var node_1 = $.child(button_4);

	{
		var consequent_1 = ($$anchor) => {
			LucideSquare($$anchor, { class: 'size-3' });
		};

		var alternate_1 = ($$anchor) => {
			LucidePlay($$anchor, { class: 'size-3' });
		};

		$.if(node_1, ($$render) => {
			if ($.get(playingAnimation) === 'translate') $$render(consequent_1); else $$render(alternate_1, -1);
		});
	}

	$.next();
	$.reset(button_4);
	$.reset(div_1);
	$.reset(div);

	var node_2 = $.sibling(div, 2);

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			const zoomFactor = $.derived(() => Math.sqrt(context().transform.scale));
			const minPixelGap = $.derived(() => minDataGap / maxDistance * context().width * context().transform.scale);
			const maxR = $.derived(() => Math.min(25 * $.get(zoomFactor), $.get(minPixelGap) / 2));
			var fragment_5 = root_2();
			var node_3 = $.first_child(fragment_5);

			Layer(node_3, {
				children: ($$anchor, $$slotProps) => {
					var fragment_6 = root_1();
					var node_4 = $.first_child(fragment_6);

					$.each(node_4, 19, () => planets, (planet) => planet.name, ($$anchor, planet, i) => {
						const cx = $.derived(() => context().xScale($.get(planet).distance));
						const r = $.derived(() => Math.max(2 * $.get(zoomFactor), rScale($.get(planet).radius) / 25 * $.get(maxR)));
						const cy = $.derived(() => context().height - 20 - $.get(i) / (planets.length - 1) * (context().height - 50));
						const labelY = $.derived(() => Math.max(10, $.get(cy) - $.get(r)));
						var fragment_7 = root();
						var line = $.first_child(fragment_7);
						var node_5 = $.sibling(line);

						{
							let $0 = $.derived(() => $.get(r) * 2);
							let $1 = $.derived(() => $.get(r) * 2);

							Image(node_5, {
								get href() {
									return $.get(planet).image;
								},

								get x() {
									return $.get(cx);
								},

								get y() {
									return $.get(cy);
								},

								get width() {
									return $.get($0);
								},

								get height() {
									return $.get($1);
								}
							});
						}

						var node_6 = $.sibling(node_5);

						Text(node_6, {
							get value() {
								return $.get(planet).name;
							},

							get x() {
								return $.get(cx);
							},

							get y() {
								return $.get(labelY);
							},
							textAnchor: 'middle',
							verticalAnchor: 'end',
							fontSize: 10,
							class: 'fill-surface-content/70'
						});

						$.template_effect(() => {
							$.set_attribute(line, 'x1', $.get(cx));
							$.set_attribute(line, 'x2', $.get(cx));
							$.set_attribute(line, 'y1', $.get(labelY));
							$.set_attribute(line, 'y2', context().height);
						});

						$.append($$anchor, fragment_7);
					});

					var node_7 = $.sibling(node_4);

					Axis(node_7, { placement: 'bottom', format: formatDistance });

					var node_8 = $.sibling(node_7);

					Highlight(node_8, { lines: true, axis: 'x' });
					$.append($$anchor, fragment_6);
				},
				$$slots: { default: true }
			});

			var node_9 = $.sibling(node_3, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_8 = root_2();
					var node_10 = $.first_child(fragment_8);

					$.component(node_10, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text();

								$.template_effect(() => $.set_text(text, data().name));
								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});

					var node_11 = $.sibling(node_10, 2);

					$.component(node_11, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_10 = root_2();
								var node_12 = $.first_child(fragment_10);

								{
									let $0 = $.derived(() => formatDistance(data().distance));

									$.component(node_12, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
										Tooltip_Item($$anchor, {
											label: 'Distance',
											get value() {
												return $.get($0);
											}
										});
									});
								}

								var node_13 = $.sibling(node_12, 2);

								{
									let $0 = $.derived(() => `${data().radius.toLocaleString()} km`);

									$.component(node_13, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
										Tooltip_Item_1($$anchor, {
											label: 'Radius',
											get value() {
												return $.get($0);
											}
										});
									});
								}

								$.append($$anchor, fragment_10);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_8);
				};

				$.component(node_9, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, {
						x: 'data',
						y: 0,
						anchor: 'top',
						children,
						$$slots: { default: true }
					});
				});
			}

			$.append($$anchor, fragment_5);
		};

		let $0 = $.derived(() => ({
			mode: 'domain',
			axis: 'x',
			scaleExtent: [1, maxZoomScale],
			scrollMode: 'scale',
			motion: { type: 'spring' },
			domainExtent: { x: { min: 'data', max: 'data' } }
		}));

		Chart(node_2, {
			get data() {
				return planets;
			},
			x: 'distance',
			padding: { top: 30, bottom: 40, left: 10, right: 10 },
			get transform() {
				return $.get($0);
			},
			tooltipContext: { mode: 'bisect-x' },
			height: 300,
			clip: true,
			get context() {
				return $.get(context);
			},

			set context($$value) {
				$.set(context, $$value, true);
			},
			children,
			$$slots: { default: true }
		});
	}

	$.delegated('click', button, () => {
		stopPlaying();
		zoomToDistance(planets.find((p) => p.name === 'Mars').distance);
	});

	$.delegated('click', button_1, () => {
		stopPlaying();
		zoomToDistance(planets.find((p) => p.name === 'Saturn').distance);
	});

	$.delegated('click', button_2, () => {
		stopPlaying();
		$.get(context)?.transform.reset();
	});

	$.delegated('click', button_3, () => {
		if ($.get(playingAnimation) === 'scale') {
			stopPlaying();
			$.get(context)?.transform.reset();
		} else {
			play('scale', scaleSteps());
		}
	});

	$.delegated('click', button_4, () => {
		if ($.get(playingAnimation) === 'translate') {
			stopPlaying();
			$.get(context)?.transform.reset();
		} else {
			play('translate', translateSteps());
		}
	});

	$.append($$anchor, fragment);

	return $.pop($$exports);
}

$.delegate(['click']);
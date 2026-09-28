import 'svelte/internal/disclose-version';
import { getCountriesTopology } from '$lib/geo.remote.js';
import * as $ from 'svelte/internal/client';
import { geoOrthographic, geoCentroid } from 'd3-geo';
import { feature } from 'topojson-client';
import { index } from 'd3-array';
import { Chart, getSettings, Layer, Tooltip, defaultChartPadding } from 'layerchart';
import { GeoPath, Graticule } from 'layerchart/geo';
import { Button } from 'svelte-ux';
import { sortFunc } from '@layerstack/utils';
import { scrollIntoView } from '@layerstack/svelte-actions';
import { cls } from '@layerstack/tailwind';
import { TimerState } from '@layerstack/svelte-state';
import { timings } from './animated-timings.js';
import AnimatedGlobeControls from '$lib/components/controls/GeoPathGlobeControls.svelte';

const topology = await getCountriesTopology();
var root = $.from_html(`<div class="absolute bottom-0 right-0 z-10 grid gap-1"></div>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<div><!></div>`);
var root_4 = $.from_html(`<div class="grid sm:h-[600px] sm:grid-cols-[1fr_224px] gap-3 relative"><!> <!> <div class="h-75 sm:h-full overflow-auto scrollbar-none"></div></div>`);

export default function Animated_globe($$anchor, $$props) {
	$.push($$props, true);

	const countries = feature(topology, topology.objects.countries);
	let context = $.state(null);
	let selectedFeature = $.state(null);

	$.user_pre_effect(() => {
		if ($.get(selectedFeature) && $.get(context)?.transform) {
			const centroid = geoCentroid($.get(selectedFeature));

			$.get(context).transform.setTranslate({ x: -centroid[0], y: -centroid[1] });
		}
	});

	// Animate to Yakko's song
	// https://animaniacs.fandom.com/wiki/Yakko%27s_World_(song)#New_Updated_Verse
	// https://www.youtube.com/watch?v=BoaLSUKeGWw
	// https://www.youtube.com/watch?v=5pOFKmk7ytU
	const countryFeaturesByName = index(countries.features, (f) => f.properties.name);

	const countryTimings = Object.entries(timings).map(([timing, country], index) => {
		const [hours, minutes, seconds, milli] = timing.split(':');

		return {
			country,
			audioTime: +hours * 60 * 60 + +minutes * 60 + +seconds + +milli / 1000
		};
	});

	// Set to jump to a country
	let currentIndex = $.state(-1);

	let isPlaying = $.state(false);

	$.user_effect(() => {
		if ($.get(isPlaying) && (audioCurrentTime.current ?? 0) >= countryTimings[$.get(currentIndex) + 1]?.audioTime) {
			const countryName = countryTimings[$.get(currentIndex) + 1].country;

			$.set(selectedFeature, countryFeaturesByName.get(countryName) ?? null, true);
			$.set(currentIndex, $.get(currentIndex) + 1);
		}
	});

	const audioFile = new Audio('/audio/yakko_world.mp3');

	audioFile.addEventListener('ended', () => stop());

	const audioCurrentTime = new TimerState({ initial: 0, delay: 100, tick: () => audioFile.currentTime });

	async function play() {
		$.set(isPlaying, true);
		audioFile.currentTime = $.get(currentIndex) !== -1 ? countryTimings[$.get(currentIndex)].audioTime : 0;
		audioFile.play();
	}

	function stop() {
		$.set(isPlaying, false);
		audioFile.pause();
		audioFile.currentTime = 0;
		$.set(currentIndex, -1);
		$.set(selectedFeature, null);
	}

	let settings = getSettings();
	let layer = $.derived(() => settings.layer);
	let debug = $.derived(() => settings.debug);
	const data = { topology, countries, timings };
	var $$exports = { data };
	var div = root_4();
	var node = $.child(div);

	AnimatedGlobeControls(node, {
		get isPlaying() {
			return $.get(isPlaying);
		},

		get selectedFeature() {
			return $.get(selectedFeature);
		},
		play,
		stop
	});

	var node_1 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => ({ projection: geoOrthographic, fitGeojson: countries }));

		Chart(node_1, {
			get geo() {
				return $.get($0);
			},

			transform: {
				mode: 'projection',
				motion: { type: 'spring', stiffness: 0.04 },
				inertia: true
			},
			tooltipContext: { touchEvents: 'none' },
			padding: { top: 5, bottom: 5, left: 5, right: 5 },
			height: 600,
			get context() {
				return $.get(context);
			},

			set context($$value) {
				$.set(context, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root_2();
				var node_2 = $.first_child(fragment);

				{
					var consequent = ($$anchor) => {
						var div_1 = root();

						$.append($$anchor, div_1);
					};

					$.if(node_2, ($$render) => {
						if ($.get(debug)) $$render(consequent);
					});
				}

				var node_3 = $.sibling(node_2, 2);

				Layer(node_3, {
					get debug() {
						return $.get(debug);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root_1();
						var node_4 = $.first_child(fragment_1);

						GeoPath(node_4, { geojson: { type: 'Sphere' }, class: 'fill-blue-400/50' });

						var node_5 = $.sibling(node_4, 2);

						Graticule(node_5, { class: 'stroke-surface-content/20' });

						var node_6 = $.sibling(node_5, 2);

						$.each(node_6, 16, () => countries.features, (country) => country, ($$anchor, country) => {
							{
								let $0 = $.derived(() => cls('stroke-surface-content/50 fill-white cursor-pointer', $.get(selectedFeature)?.properties.name === country.properties.name
									? 'stroke-primary-900 fill-primary'
									: 'hover:fill-gray-200'));

								GeoPath($$anchor, {
									get geojson() {
										return country;
									},

									get class() {
										return $.get($0);
									},
									onclick: () => $.set(selectedFeature, country, true),
									tooltip: true
								});
							}
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});

				var node_7 = $.sibling(node_3, 2);

				{
					var consequent_2 = ($$anchor) => {
						Layer($$anchor, {
							type: 'canvas',
							pointerEvents: false,
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = $.comment();
								var node_8 = $.first_child(fragment_4);

								{
									var consequent_1 = ($$anchor) => {
										GeoPath($$anchor, {
											get geojson() {
												return $.get(context).tooltip.data;
											},
											class: 'fill-surface-content/20'
										});
									};

									$.if(node_8, ($$render) => {
										if ($.get(context).tooltip.data) $$render(consequent_1);
									});
								}

								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});
					};

					$.if(node_7, ($$render) => {
						if ($.get(layer) === 'canvas') $$render(consequent_2);
					});
				}

				var node_9 = $.sibling(node_7, 2);

				$.component(node_9, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text();

							$.template_effect(() => $.set_text(text, $.get(context).tooltip.data.properties.name));
							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	}

	var div_2 = $.sibling(node_1, 2);

	$.each(div_2, 20, () => countries.features.sort(sortFunc('properties.name')), (country) => country, ($$anchor, country) => {
		const isSelected = $.derived(() => $.get(selectedFeature)?.properties.name === country.properties.name);
		var div_3 = root_3();
		var node_10 = $.child(div_3);

		{
			let $0 = $.derived(() => $.get(isSelected) ? 'fill-light' : 'default');
			let $1 = $.derived(() => $.get(isSelected) ? 'primary' : 'default');

			Button(node_10, {
				get variant() {
					return $.get($0);
				},

				get color() {
					return $.get($1);
				},
				fullWidth: true,
				$$events: { click: () => $.set(selectedFeature, country, true) },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text();

					$.template_effect(() => $.set_text(text_1, country.properties.name));
					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});
		}

		$.reset(div_3);
		$.action(div_3, ($$node, $$action_arg) => scrollIntoView?.($$node, $$action_arg), () => ({ condition: $.get(isSelected) }));
		$.append($$anchor, div_3);
	});

	$.reset(div_2);
	$.reset(div);
	$.append($$anchor, div);

	return $.pop($$exports);
}
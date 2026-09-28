import * as $ from 'svelte/internal/server';
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
import { getCountriesTopology } from '$lib/geo.remote.js';

const topology = await getCountriesTopology();

export default function Animated_globe($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const countries = feature(topology, topology.objects.countries);
		let context = null;
		let selectedFeature = null;

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
		let currentIndex = -1;

		let isPlaying = false;
		const audioFile = new Audio('/audio/yakko_world.mp3');

		audioFile.addEventListener('ended', () => stop());

		const audioCurrentTime = new TimerState({ initial: 0, delay: 100, tick: () => audioFile.currentTime });

		async function play() {
			isPlaying = true;
			audioFile.currentTime = currentIndex !== -1 ? countryTimings[currentIndex].audioTime : 0;
			audioFile.play();
		}

		function stop() {
			isPlaying = false;
			audioFile.pause();
			audioFile.currentTime = 0;
			currentIndex = -1;
			selectedFeature = null;
		}

		let settings = getSettings();
		let layer = $.derived(() => settings.layer);
		let debug = $.derived(() => settings.debug);
		const data = { topology, countries, timings };
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="grid sm:h-[600px] sm:grid-cols-[1fr_224px] gap-3 relative">`);
			AnimatedGlobeControls($$renderer, { isPlaying, selectedFeature, play, stop });
			$$renderer.push(`<!----> `);

			Chart($$renderer, {
				geo: { projection: geoOrthographic, fitGeojson: countries },
				transform: {
					mode: 'projection',
					motion: { type: 'spring', stiffness: 0.04 },
					inertia: true
				},
				tooltipContext: { touchEvents: 'none' },
				padding: { top: 5, bottom: 5, left: 5, right: 5 },
				height: 600,
				get context() {
					return context;
				},

				set context($$value) {
					context = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					if (debug()) {
						$$renderer.push(`<!--[0--><div class="absolute bottom-0 right-0 z-10 grid gap-1"></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					Layer($$renderer, {
						debug: debug(),
						children: ($$renderer) => {
							GeoPath($$renderer, { geojson: { type: 'Sphere' }, class: 'fill-blue-400/50' });
							$$renderer.push(`<!----> `);
							Graticule($$renderer, { class: 'stroke-surface-content/20' });
							$$renderer.push(`<!----> <!--[-->`);

							const each_array = $.ensure_array_like(countries.features);

							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let country = each_array[$$index];

								GeoPath($$renderer, {
									geojson: country,
									class: cls('stroke-surface-content/50 fill-white cursor-pointer', selectedFeature?.properties.name === country.properties.name
										? 'stroke-primary-900 fill-primary'
										: 'hover:fill-gray-200'),
									onclick: () => selectedFeature = country,
									tooltip: true
								});
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					if (layer() === 'canvas') {
						$$renderer.push('<!--[0-->');

						Layer($$renderer, {
							type: 'canvas',
							pointerEvents: false,
							children: ($$renderer) => {
								if (context.tooltip.data) {
									$$renderer.push('<!--[0-->');

									GeoPath($$renderer, {
										geojson: context.tooltip.data,
										class: 'fill-surface-content/20'
									});
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]-->`);
							},
							$$slots: { default: true }
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (Tooltip.Root) {
						$$renderer.push('<!--[-->');

						Tooltip.Root($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(context.tooltip.data.properties.name)}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="h-75 sm:h-full overflow-auto scrollbar-none"><!--[-->`);

			const each_array_1 = $.ensure_array_like(countries.features.sort(sortFunc('properties.name')));

			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let country = each_array_1[$$index_1];
				const isSelected = selectedFeature?.properties.name === country.properties.name;

				$$renderer.push(`<div>`);

				Button($$renderer, {
					variant: isSelected ? 'fill-light' : 'default',
					color: isSelected ? 'primary' : 'default',
					fullWidth: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(country.properties.name)}`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			}

			$$renderer.push(`<!--]--></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { data });
	});
}
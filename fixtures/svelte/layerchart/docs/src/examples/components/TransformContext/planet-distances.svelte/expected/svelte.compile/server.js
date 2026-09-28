import * as $ from 'svelte/internal/server';
import { cubicOut } from 'svelte/easing';
import { scaleSqrt } from 'd3-scale';
import { Chart, Image, Text, Axis, Highlight, Layer, Tooltip } from 'layerchart';
import { delay } from '@layerstack/utils';
import LucidePlay from '~icons/lucide/play';
import LucideSquare from '~icons/lucide/square';

export default function Planet_distances($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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
		let context = null;
		let playingAnimation = null;

		function formatDistance(d) {
			if (d === 0) return '0';
			if (d >= 1e9) return `${(d / 1e9).toFixed(1)}B km`;

			return `${Math.round(d / 1e6)}M km`;
		}

		let cancelPlaying = null;

		function stopPlaying() {
			cancelPlaying?.();
			cancelPlaying = null;
			playingAnimation = null;
		}

		async function play(name, steps) {
			stopPlaying();

			let cancelled = false;

			cancelPlaying = () => cancelled = true;
			playingAnimation = name;

			let result = steps.next();

			while (!result.done) {
				if (cancelled) return;

				await delay(result.value);

				if (cancelled) return;

				result = steps.next();
			}

			context.transform.reset();
			cancelPlaying = null;
			playingAnimation = null;
		}

		function zoomToDistance(distance) {
			context.transform.setTranslate({ x: 0, y: 0 });
			context.transform.setScale(maxDistance / (distance * 1.05));
		}

		function centerOnPlanet(distance) {
			const scale = maxZoomScale;
			const tx = (0.5 - distance * scale / maxDistance) * context.width;

			context.transform.setScale(scale);
			context.transform.setTranslate({ x: tx, y: 0 });
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

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex items-center gap-2 mb-2 text-sm"><button class="px-3 py-1 rounded border border-surface-content/20 hover:bg-surface-content/5">Inner Planets</button> <button class="px-3 py-1 rounded border border-surface-content/20 hover:bg-surface-content/5">Mid System</button> <button class="px-3 py-1 rounded border border-surface-content/20 hover:bg-surface-content/5">Show All</button> <div class="ml-auto flex items-center gap-2"><button class="px-3 py-1 rounded border border-pink-500/50 text-pink-500 hover:bg-pink-500/10 inline-flex items-center gap-1">`);

			if (playingAnimation === 'scale') {
				$$renderer.push('<!--[0-->');
				LucideSquare($$renderer, { class: 'size-3' });
			} else {
				$$renderer.push('<!--[-1-->');
				LucidePlay($$renderer, { class: 'size-3' });
			}

			$$renderer.push(`<!--]--> Scale</button> <button class="px-3 py-1 rounded border border-pink-500/50 text-pink-500 hover:bg-pink-500/10 inline-flex items-center gap-1">`);

			if (playingAnimation === 'translate') {
				$$renderer.push('<!--[0-->');
				LucideSquare($$renderer, { class: 'size-3' });
			} else {
				$$renderer.push('<!--[-1-->');
				LucidePlay($$renderer, { class: 'size-3' });
			}

			$$renderer.push(`<!--]--> Translate</button></div></div> `);

			{
				function children($$renderer, { context }) {
					const zoomFactor = Math.sqrt(context.transform.scale);
					const minPixelGap = minDataGap / maxDistance * context.width * context.transform.scale;
					const maxR = Math.min(25 * zoomFactor, minPixelGap / 2);

					Layer($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!--[-->`);

							const each_array = $.ensure_array_like(planets);

							for (let i = 0, $$length = each_array.length; i < $$length; i++) {
								let planet = each_array[i];
								const cx = context.xScale(planet.distance);
								const r = Math.max(2 * zoomFactor, rScale(planet.radius) / 25 * maxR);
								const cy = context.height - 20 - i / (planets.length - 1) * (context.height - 50);
								const labelY = Math.max(10, cy - r);

								$$renderer.push(`<line${$.attr('x1', cx)}${$.attr('x2', cx)}${$.attr('y1', labelY)}${$.attr('y2', context.height)} stroke="currentColor" stroke-opacity="0.1" stroke-dasharray="4 3" stroke-width="0.5"></line>`);

								Image($$renderer, {
									href: planet.image,
									x: cx,
									y: cy,
									width: r * 2,
									height: r * 2
								});

								$$renderer.push(`<!---->`);

								Text($$renderer, {
									value: planet.name,
									x: cx,
									y: labelY,
									textAnchor: 'middle',
									verticalAnchor: 'end',
									fontSize: 10,
									class: 'fill-surface-content/70'
								});

								$$renderer.push(`<!---->`);
							}

							$$renderer.push(`<!--]-->`);
							Axis($$renderer, { placement: 'bottom', format: formatDistance });
							$$renderer.push(`<!---->`);
							Highlight($$renderer, { lines: true, axis: 'x' });
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					{
						function children($$renderer, { data }) {
							if (Tooltip.Header) {
								$$renderer.push('<!--[-->');

								Tooltip.Header($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(data.name)}`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Tooltip.List) {
								$$renderer.push('<!--[-->');

								Tooltip.List($$renderer, {
									children: ($$renderer) => {
										if (Tooltip.Item) {
											$$renderer.push('<!--[-->');
											Tooltip.Item($$renderer, { label: 'Distance', value: formatDistance(data.distance) });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Tooltip.Item) {
											$$renderer.push('<!--[-->');
											Tooltip.Item($$renderer, { label: 'Radius', value: `${data.radius.toLocaleString()} km` });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						if (Tooltip.Root) {
							$$renderer.push('<!--[-->');

							Tooltip.Root($$renderer, {
								x: 'data',
								y: 0,
								anchor: 'top',
								children,
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}
				}

				Chart($$renderer, {
					data: planets,
					x: 'distance',
					padding: { top: 30, bottom: 40, left: 10, right: 10 },
					transform: {
						mode: 'domain',
						axis: 'x',
						scaleExtent: [1, maxZoomScale],
						scrollMode: 'scale',
						motion: { type: 'spring' },
						domainExtent: { x: { min: 'data', max: 'data' } }
					},
					tooltipContext: { mode: 'bisect-x' },
					height: 300,
					clip: true,
					get context() {
						return context;
					},

					set context($$value) {
						context = $$value;
						$$settled = false;
					},
					children,
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { data: planets });
	});
}
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { geoOrthographic } from 'd3-geo';
import { Chart, Layer } from 'layerchart';
import { GeoPath, GeoRaster, Graticule } from 'layerchart/geo';
import { Button, ButtonGroup, Field, RangeField, SelectField } from 'svelte-ux';
import { TimerState } from '@layerstack/svelte-state';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex gap-4 items-center mb-4 screenshot-hidden"><!> <!> <!></div> <!>`, 1);

export default function Planets($$anchor, $$props) {
	$.push($$props, true);

	// Equirectangular planetary surface maps sourced from Solar System Scope
	// (https://www.solarsystemscope.com/textures) — CC BY 4.0.
	const planets = [
		{ label: 'Mercury', value: '/images/planets/mercury.jpg' },
		{ label: 'Venus', value: '/images/planets/venus_surface.jpg' },
		{ label: 'Earth', value: '/images/blue-marble.jpg' },
		{ label: 'Moon', value: '/images/planets/moon.jpg' },
		{ label: 'Mars', value: '/images/planets/mars.jpg' },
		{ label: 'Jupiter', value: '/images/planets/jupiter.jpg' },
		{ label: 'Saturn', value: '/images/planets/saturn.jpg' },
		{ label: 'Uranus', value: '/images/planets/uranus.jpg' },
		{ label: 'Neptune', value: '/images/planets/neptune.jpg' }
	];

	let planet = $.state($.proxy(planets.find((p) => p.label === 'Jupiter').value));
	let context = $.state(void 0);
	let velocity = $.state(3);

	const timer = new TimerState({
		delay: 1,
		tick: () => {
			if (!$.get(context)) return;

			const curr = $.get(context).transform.translate;

			$.get(context).transform.translate = { x: curr.x += $.get(velocity), y: curr.y };
		},
		disabled: true
	});

	var fragment = root_1();
	var div = $.first_child(fragment);
	var node = $.child(div);

	SelectField(node, {
		label: 'Planet',
		get options() {
			return planets;
		},
		clearable: false,
		toggleIcon: null,
		stepper: true,
		classes: { root: 'w-60' },
		get value() {
			return $.get(planet);
		},

		set value($$value) {
			$.set(planet, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	Field(node_1, {
		label: 'Spin:',
		dense: true,
		labelPlacement: 'left',
		children: ($$anchor, $$slotProps) => {
			ButtonGroup($$anchor, {
				size: 'sm',
				variant: 'fill-light',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_2 = $.first_child(fragment_2);

					Button(node_2, {
						get disabled() {
							return timer.running;
						},

						$$events: {
							click: function (...$$args) {
								timer.start?.apply(this, $$args);
							}
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Start');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					{
						let $0 = $.derived(() => !timer.running);

						Button(node_3, {
							get disabled() {
								return $.get($0);
							},

							$$events: {
								click: function (...$$args) {
									timer.stop?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text('Stop');

								$.append($$anchor, text_1);
							},
							$$slots: { default: true }
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_1, 2);

	{
		let $0 = $.derived(() => !timer.running);

		RangeField(node_4, {
			label: 'Velocity:',
			min: -10,
			max: 10,
			get disabled() {
				return $.get($0);
			},
			labelPlacement: 'left',
			class: 'flex-1',
			get value() {
				return $.get(velocity);
			},

			set value($$value) {
				$.set(velocity, $$value, true);
			}
		});
	}

	$.reset(div);

	var node_5 = $.sibling(div, 2);

	{
		let $0 = $.derived(() => ({ projection: geoOrthographic, fitGeojson: { type: 'Sphere' } }));

		Chart(node_5, {
			get geo() {
				return $.get($0);
			},

			transform: {
				mode: 'projection',
				constrain: ({ scale, translate }) => ({
					scale,
					translate: { x: translate.x, y: Math.max(-90, Math.min(90, translate.y)) }
				})
			},

			get ondragstart() {
				return timer.stop;
			},
			padding: { top: 10, bottom: 10, left: 10, right: 10 },
			height: 500,
			get context() {
				return $.get(context);
			},

			set context($$value) {
				$.set(context, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_3 = root();
				var node_6 = $.first_child(fragment_3);

				Layer(node_6, {
					type: 'canvas',
					children: ($$anchor, $$slotProps) => {
						GeoRaster($$anchor, {
							get image() {
								return $.get(planet);
							},
							interpolate: 'bilinear'
						});
					},
					$$slots: { default: true }
				});

				var node_7 = $.sibling(node_6, 2);

				Layer(node_7, {
					type: 'svg',
					children: ($$anchor, $$slotProps) => {
						var fragment_5 = root();
						var node_8 = $.first_child(fragment_5);

						GeoPath(node_8, {
							geojson: { type: 'Sphere' },
							class: 'fill-none stroke-surface-content/30'
						});

						var node_9 = $.sibling(node_8, 2);

						Graticule(node_9, { class: 'stroke-surface-content/10' });
						$.append($$anchor, fragment_5);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_3);
			},
			$$slots: { default: true }
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}
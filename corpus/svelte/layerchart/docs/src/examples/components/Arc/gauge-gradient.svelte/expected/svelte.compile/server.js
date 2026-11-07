import * as $ from 'svelte/internal/server';
import { Arc, Chart, Circle, Group, Layer, Line, Text } from 'layerchart';
import { scaleLinear } from 'd3-scale';
import * as chromatic from 'd3-scale-chromatic';
import { RangeField, SelectField, Switch } from 'svelte-ux';

export default function Gauge_gradient($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let value = 68;
		let segments = 150;
		let tickCount = 5;
		let outerRadius = 80;
		let innerRadius = 68;
		let arcSpan = 240;
		let colorScheme = 'interpolateRdYlBu';
		let invertColors = true;

		const colorSchemes = [
			'interpolateRdYlBu',
			'interpolateRdYlGn',
			'interpolateSpectral',
			'interpolateRdBu',
			'interpolatePiYG',
			'interpolatePRGn',
			'interpolateBrBG',
			'interpolateRdGy',
			'interpolatePuOr',
			'interpolateViridis',
			'interpolatePlasma',
			'interpolateInferno',
			'interpolateMagma',
			'interpolateTurbo',
			'interpolateCool',
			'interpolateWarm',
			'interpolateRainbow',
			'interpolateSinebow',
			'interpolateCividis'
		];

		const domain = [0, 100];
		const halfSpan = $.derived(() => arcSpan / 2);
		const angleRange = $.derived(() => [-halfSpan(), halfSpan()]);
		const angleScale = $.derived(() => scaleLinear().domain(domain).range(angleRange()));
		const interpolate = $.derived(() => chromatic[colorScheme]);

		const segmentData = $.derived(() => Array.from({ length: segments }, (_, i) => {
			const t = i / segments;

			return {
				startAngle: angleScale()(t * 100) * Math.PI / 180,
				endAngle: angleScale()((i + 1) / segments * 100) * Math.PI / 180,
				color: interpolate()(invertColors ? 1 - t : t)
			};
		}));

		const ticks = $.derived(() => Array.from({ length: tickCount + 1 }, (_, i) => i / tickCount * 100));
		const needleAngleRad = $.derived(() => angleScale()(value) * Math.PI / 180);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="grid grid-cols-[1fr_1fr_1fr] gap-2 mb-2">`);

			RangeField($$renderer, {
				label: 'Value',
				min: 0,
				max: 100,
				step: 1,
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Arc Span',
				min: 10,
				max: 360,
				step: 5,
				get value() {
					return arcSpan;
				},

				set value($$value) {
					arcSpan = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Ticks',
				min: 1,
				max: 20,
				get value() {
					return tickCount;
				},

				set value($$value) {
					tickCount = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Inner Radius',
				min: 10,
				max: outerRadius - 2,
				get value() {
					return innerRadius;
				},

				set value($$value) {
					innerRadius = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Outer Radius',
				min: 20,
				max: 120,
				get value() {
					return outerRadius;
				},

				set value($$value) {
					outerRadius = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Color Steps',
				min: tickCount,
				max: 200,
				get value() {
					return segments;
				},

				set value($$value) {
					segments = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			SelectField($$renderer, {
				label: 'Color Scheme',
				options: colorSchemes.map((s) => ({ label: s.replace('interpolate', ''), value: s })),
				stepper: true,
				clearable: false,
				toggleIcon: null,
				class: 'col-span-full',
				get value() {
					return colorScheme;
				},

				set value($$value) {
					colorScheme = $$value;
					$$settled = false;
				},

				$$slots: {
					append: ($$renderer) => {
						$$renderer.push(`<div slot="append" role="none"><div class="text-[10px] text-surface-content/50 text-center">Invert</div> `);

						Switch($$renderer, {
							size: 'md',
							get checked() {
								return invertColors;
							},

							set checked($$value) {
								invertColors = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----></div>`);
					}
				}
			});

			$$renderer.push(`<!----></div> `);

			Chart($$renderer, {
				height: 200,
				padding: 20,
				children: ($$renderer) => {
					Layer($$renderer, {
						center: true,
						children: ($$renderer) => {
							Group($$renderer, {
								y: 16,
								children: ($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array = $.ensure_array_like(segmentData());

									for (let i = 0, $$length = each_array.length; i < $$length; i++) {
										let seg = each_array[i];

										Arc($$renderer, {
											startAngle: seg.startAngle,
											endAngle: seg.endAngle,
											outerRadius,
											innerRadius,
											fill: seg.color
										});
									}

									$$renderer.push(`<!--]--> <!--[-->`);

									const each_array_1 = $.ensure_array_like(ticks());

									for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
										let tick = each_array_1[$$index_1];
										const angleRad = angleScale()(tick) * Math.PI / 180;
										const tickInner = innerRadius - 0;
										const tickOuter = outerRadius + 0;
										const labelRadius = innerRadius - 14;

										Line($$renderer, {
											x1: Math.sin(angleRad) * tickInner,
											y1: -Math.cos(angleRad) * tickInner,
											x2: Math.sin(angleRad) * tickOuter,
											y2: -Math.cos(angleRad) * tickOuter,
											class: 'stroke-surface-200',
											strokeWidth: 1.5
										});

										$$renderer.push(`<!----> `);

										Text($$renderer, {
											x: Math.sin(angleRad) * labelRadius,
											y: -Math.cos(angleRad) * labelRadius,
											value: tick / 100,
											format: 'percentRound',
											textAnchor: 'middle',
											verticalAnchor: 'middle',
											class: 'text-[8px] fill-surface-content/50 tabular-nums'
										});

										$$renderer.push(`<!---->`);
									}

									$$renderer.push(`<!--]--> `);

									Line($$renderer, {
										x1: Math.sin(needleAngleRad()) * -10,
										y1: -Math.cos(needleAngleRad()) * -10,
										x2: Math.sin(needleAngleRad()) * (outerRadius + 2),
										y2: -Math.cos(needleAngleRad()) * (outerRadius + 2),
										class: 'stroke-surface-content',
										strokeWidth: 2
									});

									$$renderer.push(`<!----> `);
									Circle($$renderer, { r: 6, class: 'fill-surface-content' });
									$$renderer.push(`<!----> `);
									Circle($$renderer, { r: 3, class: 'fill-surface-200' });
									$$renderer.push(`<!----> `);

									Text($$renderer, {
										value: value + '%',
										textAnchor: 'middle',
										verticalAnchor: 'middle',
										dy: 30,
										class: 'text-2xl font-bold tabular-nums'
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { data: value });
	});
}
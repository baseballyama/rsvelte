import * as $ from 'svelte/internal/server';
import { Chart, Layer, Line } from 'layerchart';
import { scaleLinear } from 'd3-scale';
import { AnimationFrames } from 'runed';
import { Button, ButtonGroup } from 'svelte-ux';
import { cls } from '@layerstack/tailwind';
import ResizableRect from './ResizableRect.svelte';
import LucidePlay from '~icons/lucide/play';
import LucideSquare from '~icons/lucide/square';

export default function DomainRangeChart($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const rectHeight = 64;

		let {
			domain = [100, 400],
			range = [0, 500],
			value = 0,
			rangeValue = 0
		} = $$props;

		let scale = $.derived(() => scaleLinear().domain(domain).range(range));
		const chartDomain = [0, 500];

		// Initialize domainValue and rangeValue if not provided
		// Track hover state for domain and range rects
		let isHoveringDomain = false;

		let isHoveringRange = false;

		// Animation state
		let isPlaying = true;

		let animationDirection = 'forward';
		const animationSpeed = 1; // whole integers per step

		const animationFrames = new AnimationFrames(
			() => {
				if (isPlaying && !isHoveringDomain && !isHoveringRange) {
					if (animationDirection === 'forward') {
						value = Math.min(Math.round(value + animationSpeed), domain[1]);

						if (value >= domain[1]) {
							animationDirection = 'backward';
						}
					} else {
						value = Math.max(Math.round(value - animationSpeed), domain[0]);

						if (value <= domain[0]) {
							animationDirection = 'forward';
						}
					}

					rangeValue = Math.round(scale()(value));
				}
			},
			{ fpsLimit: 60 }
		);

		let context = null;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="text-right">`);

			ButtonGroup($$renderer, {
				variant: 'fill-light',
				color: 'primary',
				size: 'sm',
				class: 'outline rounded-full',
				children: ($$renderer) => {
					Button($$renderer, {
						icon: LucidePlay,
						disabled: isPlaying,
						classes: { icon: 'text-xs', root: 'pl-2 pr-1 py-1' }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						icon: LucideSquare,
						disabled: !isPlaying,
						classes: { icon: 'text-xs', root: 'pl-1 pr-2 py-1' }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			{
				function children($$renderer, { context }) {
					Layer($$renderer, {
						type: 'html',
						children: ($$renderer) => {
							ResizableRect($$renderer, {
								context,
								label: 'Domain',
								y: 0,
								chartDomain,
								onValueChange: (v) => {
									rangeValue = Math.round(scale()(v));
								},

								get bounds() {
									return domain;
								},

								set bounds($$value) {
									domain = $$value;
									$$settled = false;
								},

								get value() {
									return value;
								},

								set value($$value) {
									value = $$value;
									$$settled = false;
								},

								get isHovering() {
									return isHoveringDomain;
								},

								set isHovering($$value) {
									isHoveringDomain = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							ResizableRect($$renderer, {
								context,
								label: 'Range',
								y: context.height - 64,
								chartDomain,
								onValueChange: (v) => {
									value = Math.round(scale().invert(v));
								},

								get bounds() {
									return range;
								},

								set bounds($$value) {
									range = $$value;
									$$settled = false;
								},

								get value() {
									return rangeValue;
								},

								set value($$value) {
									rangeValue = $$value;
									$$settled = false;
								},

								get isHovering() {
									return isHoveringRange;
								},

								set isHovering($$value) {
									isHoveringRange = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Layer($$renderer, {
						type: 'svg',
						pointerEvents: false,
						children: ($$renderer) => {
							const lineCount = 20;

							$$renderer.push(`<!--[-->`);

							const each_array = $.ensure_array_like(Array.from({ length: lineCount }));

							for (let i = 0, $$length = each_array.length; i < $$length; i++) {
								let _ = each_array[i];
								const t = i / (lineCount - 1);
								const domainVal = domain[0] + (domain[1] - domain[0]) * t;
								const rangeVal = range[0] + (range[1] - range[0]) * t;

								Line($$renderer, {
									x1: context.xScale(domainVal),
									y1: rectHeight,
									x2: context.xScale(rangeVal),
									y2: context.height - rectHeight,
									strokeWidth: 2,
									class: cls('', i === 0 || i === lineCount - 1
										? 'stroke-surface-content/20'
										: 'stroke-surface-content/10 ')
								});
							}

							$$renderer.push(`<!--]--> `);

							Line($$renderer, {
								x1: context.xScale(value),
								y1: rectHeight,
								x2: context.xScale(rangeValue),
								y2: context.height - rectHeight,
								strokeWidth: 2,
								class: 'stroke-surface-content',
								markerEnd: 'triangle'
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				}

				Chart($$renderer, {
					xDomain: chartDomain,
					height: 250,
					padding: { top: 16, right: 16, bottom: 16, left: 16 },
					class: 'select-none',
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
		$.bind_props($$props, { domain, range, value, rangeValue });
	});
}
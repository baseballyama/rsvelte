import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Layer, Line } from 'layerchart';
import { scaleLinear } from 'd3-scale';
import { AnimationFrames } from 'runed';
import { Button, ButtonGroup } from 'svelte-ux';
import { cls } from '@layerstack/tailwind';
import ResizableRect from './ResizableRect.svelte';
import LucidePlay from '~icons/lucide/play';
import LucideSquare from '~icons/lucide/square';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="text-right"><!></div> <!>`, 1);

export default function DomainRangeChart($$anchor, $$props) {
	$.push($$props, true);

	const rectHeight = 64;

	let domain = $.prop($$props, 'domain', 31, () => $.proxy([100, 400])),
		range = $.prop($$props, 'range', 31, () => $.proxy([0, 500])),
		value = $.prop($$props, 'value', 15, 0),
		rangeValue = $.prop($$props, 'rangeValue', 15, 0);

	let scale = $.derived(() => scaleLinear().domain(domain()).range(range()));
	const chartDomain = [0, 500];

	// Initialize domainValue and rangeValue if not provided
	$.user_effect(() => {
		if (value() === 0) {
			value(Math.round(domain()[0] + (domain()[1] - domain()[0]) / 2));
		}

		if (rangeValue() === 0) {
			rangeValue(Math.round($.get(scale)(value())));
		}
	});

	// Track hover state for domain and range rects
	let isHoveringDomain = $.state(false);

	let isHoveringRange = $.state(false);

	// Animation state
	let isPlaying = $.state(true);

	let animationDirection = $.state('forward');
	const animationSpeed = 1; // whole integers per step

	const animationFrames = new AnimationFrames(
		() => {
			if ($.get(isPlaying) && !$.get(isHoveringDomain) && !$.get(isHoveringRange)) {
				if ($.get(animationDirection) === 'forward') {
					value(Math.min(Math.round(value() + animationSpeed), domain()[1]));

					if (value() >= domain()[1]) {
						$.set(animationDirection, 'backward');
					}
				} else {
					value(Math.max(Math.round(value() - animationSpeed), domain()[0]));

					if (value() <= domain()[0]) {
						$.set(animationDirection, 'forward');
					}
				}

				rangeValue(Math.round($.get(scale)(value())));
			}
		},
		{ fpsLimit: 60 }
	);

	let context = $.state(null);
	var fragment = root_1();
	var div = $.first_child(fragment);
	var node = $.child(div);

	ButtonGroup(node, {
		variant: 'fill-light',
		color: 'primary',
		size: 'sm',
		class: 'outline rounded-full',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Button(node_1, {
				get icon() {
					return LucidePlay;
				},

				get disabled() {
					return $.get(isPlaying);
				},
				classes: { icon: 'text-xs', root: 'pl-2 pr-1 py-1' },
				$$events: { click: () => $.set(isPlaying, true) }
			});

			var node_2 = $.sibling(node_1, 2);

			{
				let $0 = $.derived(() => !$.get(isPlaying));

				Button(node_2, {
					get icon() {
						return LucideSquare;
					},

					get disabled() {
						return $.get($0);
					},
					classes: { icon: 'text-xs', root: 'pl-1 pr-2 py-1' },
					$$events: { click: () => $.set(isPlaying, false) }
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var node_3 = $.sibling(div, 2);

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_2 = root();
			var node_4 = $.first_child(fragment_2);

			Layer(node_4, {
				type: 'html',
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root();
					var node_5 = $.first_child(fragment_3);

					ResizableRect(node_5, {
						get context() {
							return context();
						},
						label: 'Domain',
						y: 0,
						get chartDomain() {
							return chartDomain;
						},

						onValueChange: (v) => {
							rangeValue(Math.round($.get(scale)(v)));
						},

						get bounds() {
							return domain();
						},

						set bounds($$value) {
							domain($$value);
						},

						get value() {
							return value();
						},

						set value($$value) {
							value($$value);
						},

						get isHovering() {
							return $.get(isHoveringDomain);
						},

						set isHovering($$value) {
							$.set(isHoveringDomain, $$value, true);
						}
					});

					var node_6 = $.sibling(node_5, 2);

					{
						let $0 = $.derived(() => context().height - 64);

						ResizableRect(node_6, {
							get context() {
								return context();
							},
							label: 'Range',
							get y() {
								return $.get($0);
							},

							get chartDomain() {
								return chartDomain;
							},

							onValueChange: (v) => {
								value(Math.round($.get(scale).invert(v)));
							},

							get bounds() {
								return range();
							},

							set bounds($$value) {
								range($$value);
							},

							get value() {
								return rangeValue();
							},

							set value($$value) {
								rangeValue($$value);
							},

							get isHovering() {
								return $.get(isHoveringRange);
							},

							set isHovering($$value) {
								$.set(isHoveringRange, $$value, true);
							}
						});
					}

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_4, 2);

			Layer(node_7, {
				type: 'svg',
				pointerEvents: false,
				children: ($$anchor, $$slotProps) => {
					const lineCount = $.derived(() => 20);
					var fragment_4 = root();
					var node_8 = $.first_child(fragment_4);

					$.each(node_8, 17, () => Array.from({ length: $.get(lineCount) }), $.index, ($$anchor, _, i) => {
						const t = $.derived(() => i / ($.get(lineCount) - 1));
						const domainVal = $.derived(() => domain()[0] + (domain()[1] - domain()[0]) * $.get(t));
						const rangeVal = $.derived(() => range()[0] + (range()[1] - range()[0]) * $.get(t));

						{
							let $0 = $.derived(() => context().xScale($.get(domainVal)));
							let $1 = $.derived(() => context().xScale($.get(rangeVal)));
							let $2 = $.derived(() => context().height - rectHeight);

							let $3 = $.derived(() => cls('', i === 0 || i === $.get(lineCount) - 1
								? 'stroke-surface-content/20'
								: 'stroke-surface-content/10 '));

							Line($$anchor, {
								get x1() {
									return $.get($0);
								},
								y1: rectHeight,
								get x2() {
									return $.get($1);
								},

								get y2() {
									return $.get($2);
								},
								strokeWidth: 2,
								get class() {
									return $.get($3);
								}
							});
						}
					});

					var node_9 = $.sibling(node_8, 2);

					{
						let $0 = $.derived(() => context().xScale(value()));
						let $1 = $.derived(() => context().xScale(rangeValue()));
						let $2 = $.derived(() => context().height - rectHeight);

						Line(node_9, {
							get x1() {
								return $.get($0);
							},
							y1: rectHeight,
							get x2() {
								return $.get($1);
							},

							get y2() {
								return $.get($2);
							},
							strokeWidth: 2,
							class: 'stroke-surface-content',
							markerEnd: 'triangle'
						});
					}

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_2);
		};

		Chart(node_3, {
			get xDomain() {
				return chartDomain;
			},
			height: 250,
			padding: { top: 16, right: 16, bottom: 16, left: 16 },
			class: 'select-none',
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

	$.append($$anchor, fragment);
	$.pop();
}
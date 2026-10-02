import 'svelte/internal/disclose-version';
import { getFaithful } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { Button, Field, Menu, MenuField, RangeField, Switch, Toggle } from 'svelte-ux';
import { AnnotationPoint, Circle, ScatterChart } from 'layerchart';
import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';
import { movable } from '$lib/attachments/movable.js';

const data = await getFaithful();
var root = $.from_html(`<span class="text-sm"> </span>`);
var root_1 = $.from_html(`<div class="grid grid-cols-3 gap-1 p-1"></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <!> <!>`, 1);
var root_5 = $.from_html(`<div class="flex flex-wrap gap-2 mb-2 screenshot-hidden"><!> <!> <!></div> <div class="flex flex-wrap gap-2 mb-2 screenshot-hidden"><!> <!> <!> <!> <!> <!></div> <div class="flex flex-wrap gap-2 mb-2 screenshot-hidden"><!> <!></div> <!>`, 1);

export default function Playground($$anchor, $$props) {
	$.push($$props, true);

	const placementOptions = [
		'top-left',
		'top',
		'top-right',
		'left',
		'center',
		'right',
		'bottom-left',
		'bottom',
		'bottom-right',
		'smart'
	];

	const anchorOptions = ['start', 'middle', 'end'].map((v) => ({ label: v, value: v }));
	const linkTypeOptions = ['d3', 'straight', 'square', 'beveled', 'rounded', 'swoop'].map((v) => ({ label: v, value: v }));
	const linkSweepOptions = ['horizontal-vertical', 'vertical-horizontal', 'none'].map((v) => ({ label: v, value: v }));

	const linkOrientationOptions = [
		{ label: 'horizontal', value: 'horizontal' },
		{ label: 'vertical', value: 'vertical' }
	];

	let dataX = $.state(80);
	let dataY = $.state(4.25);
	let placement = $.state('bottom-right');
	let xOffset = $.state(50);
	let yOffset = $.state(50);
	let radius = $.state(60);
	let fontSize = $.state(16);
	let labelGap = $.state(2);
	let textAnchor = $.state('middle');
	let verticalAnchor = $.state('start');
	let showControls = $.state(true);
	let linkEnabled = $.state(true);
	let type = $.state('beveled');
	let curve = $.state(undefined);
	let sweep = $.state('horizontal-vertical');
	let orientation = $.state('horizontal');
	let linkRadius = $.state(30);
	let bend = $.state(22.5);

	const link = $.derived(() => $.get(linkEnabled)
		? {
			type: $.get(type),
			curve: $.get(curve),
			sweep: $.get(sweep),
			orientation: $.get(orientation),
			radius: $.get(linkRadius),
			bend: $.get(bend)
		}
		: false);

	// Sign of each offset on the label's pixel position (from AnnotationPoint's
	// labelProps math): left flips x, top flips y, other placements are +1.
	const signX = $.derived(() => $.get(placement).includes('left') ? -1 : 1);

	const signY = $.derived(() => $.get(placement).includes('top') ? -1 : 1);

	// Unit vector from ring center toward the placement direction.
	const dirX = $.derived(() => $.get(placement).includes('left') ? -1 : $.get(placement).includes('right') ? 1 : 0);

	const dirY = $.derived(() => $.get(placement).includes('top') ? -1 : $.get(placement).includes('bottom') ? 1 : 0);
	const dirMag = $.derived(() => Math.hypot($.get(dirX), $.get(dirY)) || 1);
	var $$exports = { data };
	var fragment = root_5();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Toggle(node, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const open = $.derived(() => $$slotProps.on);
				const toggle = $.derived(() => $$slotProps.toggle);
				var fragment_1 = root_2();
				var node_1 = $.first_child(fragment_1);

				Field(node_1, {
					label: 'Placement',
					class: 'cursor-pointer flex-1 basis-40',
					$$events: {
						click: function (...$$args) {
							$.get(toggle)?.apply(this, $$args);
						}
					},

					children: ($$anchor, $$slotProps) => {
						var span = root();
						var text = $.only_child(span, true);

						$.template_effect(() => $.set_text(text, $.get(placement)));
						$.append($$anchor, span);
					},
					$$slots: { default: true }
				});

				var node_2 = $.sibling(node_1, 2);

				Menu(node_2, {
					get open() {
						return $.get(open);
					},
					placement: 'bottom-start',
					$$events: {
						close: function (...$$args) {
							$.get(toggle)?.apply(this, $$args);
						}
					},

					children: ($$anchor, $$slotProps) => {
						var div_1 = root_1();

						$.each(div_1, 20, () => placementOptions, (option) => option, ($$anchor, option) => {
							{
								let $0 = $.derived(() => option === $.get(placement) ? 'primary' : 'default');

								Button($$anchor, {
									variant: 'outline',
									get color() {
										return $.get($0);
									},
									$$events: { click: () => $.set(placement, option, true) },
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text();

										$.template_effect(() => $.set_text(text_1, option));
										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							}
						});

						$.reset(div_1);
						$.append($$anchor, div_1);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_1);
			}
		}
	});

	var node_3 = $.sibling(node, 2);

	MenuField(node_3, {
		label: 'Text Anchor',
		get options() {
			return anchorOptions;
		},
		stepper: true,
		classes: { menuIcon: 'hidden', root: 'flex-1 basis-40' },
		get value() {
			return $.get(textAnchor);
		},

		set value($$value) {
			$.set(textAnchor, $$value, true);
		}
	});

	var node_4 = $.sibling(node_3, 2);

	MenuField(node_4, {
		label: 'Vertical Anchor',
		get options() {
			return anchorOptions;
		},
		stepper: true,
		classes: { menuIcon: 'hidden', root: 'flex-1 basis-40' },
		get value() {
			return $.get(verticalAnchor);
		},

		set value($$value) {
			$.set(verticalAnchor, $$value, true);
		}
	});

	$.reset(div);

	var div_2 = $.sibling(div, 2);
	var node_5 = $.child(div_2);

	Field(node_5, {
		label: 'Show controls',
		class: 'w-26 shrink-0',
		children: ($$anchor, $$slotProps) => {
			Switch($$anchor, {
				get checked() {
					return $.get(showControls);
				},

				set checked($$value) {
					$.set(showControls, $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	RangeField(node_6, {
		label: 'X offset',
		min: -100,
		max: 100,
		classes: { root: 'flex-1 basis-40' },
		get value() {
			return $.get(xOffset);
		},

		set value($$value) {
			$.set(xOffset, $$value, true);
		}
	});

	var node_7 = $.sibling(node_6, 2);

	RangeField(node_7, {
		label: 'Y offset',
		min: -100,
		max: 100,
		classes: { root: 'flex-1 basis-40' },
		get value() {
			return $.get(yOffset);
		},

		set value($$value) {
			$.set(yOffset, $$value, true);
		}
	});

	var node_8 = $.sibling(node_7, 2);

	RangeField(node_8, {
		label: 'Radius',
		min: 0,
		max: 200,
		classes: { root: 'flex-1 basis-40' },
		get value() {
			return $.get(radius);
		},

		set value($$value) {
			$.set(radius, $$value, true);
		}
	});

	var node_9 = $.sibling(node_8, 2);

	RangeField(node_9, {
		label: 'Font size',
		min: 8,
		max: 48,
		classes: { root: 'flex-1 basis-40' },
		get value() {
			return $.get(fontSize);
		},

		set value($$value) {
			$.set(fontSize, $$value, true);
		}
	});

	var node_10 = $.sibling(node_9, 2);

	RangeField(node_10, {
		label: 'Label gap',
		min: 0,
		max: 20,
		classes: { root: 'flex-1 basis-40' },
		get value() {
			return $.get(labelGap);
		},

		set value($$value) {
			$.set(labelGap, $$value, true);
		}
	});

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_11 = $.child(div_3);

	Field(node_11, {
		label: 'Link',
		class: 'w-26 shrink-0',
		children: ($$anchor, $$slotProps) => {
			Switch($$anchor, {
				get checked() {
					return $.get(linkEnabled);
				},

				set checked($$value) {
					$.set(linkEnabled, $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	var node_12 = $.sibling(node_11, 2);

	{
		var consequent_3 = ($$anchor) => {
			var fragment_6 = root_3();
			var node_13 = $.first_child(fragment_6);

			MenuField(node_13, {
				label: 'Link Type',
				get options() {
					return linkTypeOptions;
				},
				stepper: true,
				classes: { menuIcon: 'hidden', root: 'flex-1 basis-40' },
				get value() {
					return $.get(type);
				},

				set value($$value) {
					$.set(type, $$value, true);
				}
			});

			var node_14 = $.sibling(node_13, 2);

			{
				var consequent = ($$anchor) => {
					var fragment_7 = root_2();
					var node_15 = $.first_child(fragment_7);

					CurveMenuField(node_15, {
						classes: { root: 'flex-1 basis-40' },
						get value() {
							return $.get(curve);
						},

						set value($$value) {
							$.set(curve, $$value, true);
						}
					});

					var node_16 = $.sibling(node_15, 2);

					MenuField(node_16, {
						label: 'Orientation',
						get options() {
							return linkOrientationOptions;
						},
						stepper: true,
						classes: { menuIcon: 'hidden', root: 'flex-1 basis-40' },
						get value() {
							return $.get(orientation);
						},

						set value($$value) {
							$.set(orientation, $$value, true);
						}
					});

					$.append($$anchor, fragment_7);
				};

				$.if(node_14, ($$render) => {
					if ($.get(type) === 'd3') $$render(consequent);
				});
			}

			var node_17 = $.sibling(node_14, 2);

			{
				var consequent_1 = ($$anchor) => {
					RangeField($$anchor, {
						label: 'Link Radius',
						min: 0,
						classes: { root: 'flex-1 basis-40' },
						get value() {
							return $.get(linkRadius);
						},

						set value($$value) {
							$.set(linkRadius, $$value, true);
						}
					});
				};

				$.if(node_17, ($$render) => {
					if ($.get(type) === 'beveled' || $.get(type) === 'rounded') $$render(consequent_1);
				});
			}

			var node_18 = $.sibling(node_17, 2);

			{
				var consequent_2 = ($$anchor) => {
					RangeField($$anchor, {
						label: 'Bend (°)',
						min: -90,
						max: 90,
						classes: { root: 'flex-1 basis-40' },
						get value() {
							return $.get(bend);
						},

						set value($$value) {
							$.set(bend, $$value, true);
						}
					});
				};

				$.if(node_18, ($$render) => {
					if ($.get(type) === 'swoop') $$render(consequent_2);
				});
			}

			var node_19 = $.sibling(node_18, 2);

			MenuField(node_19, {
				label: 'Link Sweep',
				get options() {
					return linkSweepOptions;
				},
				stepper: true,
				classes: { menuIcon: 'hidden', root: 'flex-1 basis-40' },
				get value() {
					return $.get(sweep);
				},

				set value($$value) {
					$.set(sweep, $$value, true);
				}
			});

			$.append($$anchor, fragment_6);
		};

		$.if(node_12, ($$render) => {
			if ($.get(linkEnabled)) $$render(consequent_3);
		});
	}

	$.reset(div_3);

	var node_20 = $.sibling(div_3, 2);

	{
		const aboveMarks = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			const ringX = $.derived(() => context().xScale($.get(dataX)));
			const ringY = $.derived(() => context().yScale($.get(dataY)));
			var fragment_10 = root_2();
			var node_21 = $.first_child(fragment_10);

			{
				let $0 = $.derived(() => $.get(placement) === 'smart' ? $.get(ringX) + $.get(xOffset) : undefined);
				let $1 = $.derived(() => $.get(placement) === 'smart' ? $.get(ringY) + $.get(yOffset) : undefined);

				let $2 = $.derived(() => ({
					circle: { class: 'stroke-secondary' },
					label: {
						class: 'fill-secondary font-bold',
						...$.get(placement) === 'smart'
							? {}
							: {
								textAnchor: $.get(textAnchor),
								verticalAnchor: $.get(verticalAnchor)
							}
					}
				}));

				AnnotationPoint(node_21, {
					get x() {
						return $.get(dataX);
					},

					get y() {
						return $.get(dataY);
					},

					get r() {
						return $.get(radius);
					},

					get label() {
						return $.get(placement);
					},

					get labelPlacement() {
						return $.get(placement);
					},

					get labelXOffset() {
						return $.get(xOffset);
					},

					get labelYOffset() {
						return $.get(yOffset);
					},

					get labelX() {
						return $.get($0);
					},

					get labelY() {
						return $.get($1);
					},

					get fontSize() {
						return $.get(fontSize);
					},

					get labelGap() {
						return $.get(labelGap);
					},

					get link() {
						return $.get(link);
					},

					get props() {
						return $.get($2);
					}
				});
			}

			var node_22 = $.sibling(node_21, 2);

			{
				var consequent_4 = ($$anchor) => {
					const labelX = $.derived(() => $.get(ringX) + $.get(radius) * $.get(dirX) / $.get(dirMag) + $.get(xOffset) * $.get(signX));
					const labelY = $.derived(() => $.get(ringY) + $.get(radius) * $.get(dirY) / $.get(dirMag) + $.get(yOffset) * $.get(signY));
					var fragment_11 = root_4();
					var node_23 = $.first_child(fragment_11);

					Circle(node_23, {
						get cx() {
							return $.get(ringX);
						},

						get cy() {
							return $.get(ringY);
						},
						r: 6,
						class: 'fill-secondary/20 stroke-secondary cursor-move [stroke-dasharray:3_3]',
						[$.attachment()]: ($$node) => (movable({
							onMove: ({ dx, dy }) => {
								const xScale = context().xScale;
								const yScale = context().yScale;

								$.set(dataX, xScale.invert(xScale($.get(dataX)) + dx), true);
								$.set(dataY, yScale.invert(yScale($.get(dataY)) + dy), true);
							}
						}) || $.noop)($$node)
					});

					var node_24 = $.sibling(node_23, 2);

					Circle(node_24, {
						get cx() {
							return $.get(labelX);
						},

						get cy() {
							return $.get(labelY);
						},
						r: 6,
						class: 'fill-secondary/20 stroke-secondary cursor-move [stroke-dasharray:3_3]',
						[$.attachment()]: ($$node) => (movable({
							onMove: ({ dx, dy }) => {
								$.set(xOffset, $.get(xOffset) + dx * $.get(signX));
								$.set(yOffset, $.get(yOffset) + dy * $.get(signY));
							}
						}) || $.noop)($$node)
					});

					var node_25 = $.sibling(node_24, 2);

					{
						let $0 = $.derived(() => $.get(ringX) + $.get(radius));

						Circle(node_25, {
							get cx() {
								return $.get($0);
							},

							get cy() {
								return $.get(ringY);
							},
							r: 6,
							class: 'fill-secondary/20 stroke-secondary cursor-ew-resize [stroke-dasharray:3_3]',
							[$.attachment()]: ($$node) => (movable({
								axis: 'x',
								onMove: ({ dx }) => {
									$.set(radius, Math.max(0, $.get(radius) + dx), true);
								}
							}) || $.noop)($$node)
						});
					}

					$.append($$anchor, fragment_11);
				};

				$.if(node_22, ($$render) => {
					if ($.get(showControls)) $$render(consequent_4);
				});
			}

			$.append($$anchor, fragment_10);
		};

		ScatterChart(node_20, {
			get data() {
				return data;
			},
			x: 'waiting',
			y: 'eruptions',
			xNice: true,
			yNice: true,
			height: 400,
			padding: { top: 10, right: 10, bottom: 20, left: 30 },
			tooltipContext: false,
			aboveMarks,
			$$slots: { aboveMarks: true }
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}
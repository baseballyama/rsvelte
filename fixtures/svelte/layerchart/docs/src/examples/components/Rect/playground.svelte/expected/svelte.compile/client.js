import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Axis, Chart, Layer, Rect } from 'layerchart';
import { Field, MenuField, RangeField, ToggleGroup, ToggleOption } from 'svelte-ux';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<div class="grid grid-cols-2 gap-2 mb-2 screenshot-hidden"><!> <!></div> <div class="grid grid-cols-4 gap-2 mb-2 screenshot-hidden"><!></div> <div class="grid grid-cols-4 gap-2 mb-2 screenshot-hidden"><!> <!> <!> <!></div> <!>`, 1);

export default function Playground($$anchor, $$props) {
	$.push($$props, true);

	let valueMode = $.state('pixel');
	let propsMode = $.state('position-size');
	let pixelPosition = $.proxy({ x: 80, y: 56, width: 240, height: 160 });
	let dataPosition = $.proxy({ x: 20, y: 25, width: 240, height: 160 });
	let pixelEdges = $.proxy({ x0: 80, y0: 56, x1: 320, y1: 216 });
	let dataEdges = $.proxy({ x0: 18, y0: 18, x1: 82, y1: 78 });
	let corners = $.proxy({ topLeft: 32, topRight: 8, bottomRight: 40, bottomLeft: 16 });

	const propsOptions = [
		{ label: 'x / y / width / height', value: 'position-size' },
		{ label: 'x0 / y0 / x1 / y1', value: 'edges' }
	];

	const data = $.derived(() => [
		$.get(propsMode) === 'position-size' ? dataPosition : dataEdges
	]);

	const x = $.derived(() => $.get(propsMode) === 'position-size' ? 'x' : ['x0', 'x1']);
	const y = $.derived(() => $.get(propsMode) === 'position-size' ? 'y' : ['y0', 'y1']);
	let context = $.state(void 0);
	let previousValueMode = $.get(valueMode);

	function toPixel(scale, value) {
		return Math.round(Number(scale?.(value) ?? value));
	}

	function toData(scale, value) {
		return Math.round(Number(scale?.invert?.(value) ?? value));
	}

	$.user_effect(() => {
		const nextValueMode = $.get(valueMode);

		if (!$.get(context) || nextValueMode === previousValueMode) return;

		if (nextValueMode === 'data') {
			if ($.get(propsMode) === 'position-size') {
				dataPosition.x = toData($.get(context).xScale, pixelPosition.x);
				dataPosition.y = toData($.get(context).yScale, pixelPosition.y);
				dataPosition.width = pixelPosition.width;
				dataPosition.height = pixelPosition.height;
			} else {
				dataEdges.x0 = toData($.get(context).xScale, pixelEdges.x0);
				dataEdges.y0 = toData($.get(context).yScale, pixelEdges.y0);
				dataEdges.x1 = toData($.get(context).xScale, pixelEdges.x1);
				dataEdges.y1 = toData($.get(context).yScale, pixelEdges.y1);
			}
		} else if ($.get(propsMode) === 'position-size') {
			pixelPosition.x = toPixel($.get(context).xScale, dataPosition.x);
			pixelPosition.y = toPixel($.get(context).yScale, dataPosition.y);
			pixelPosition.width = dataPosition.width;
			pixelPosition.height = dataPosition.height;
		} else {
			pixelEdges.x0 = toPixel($.get(context).xScale, dataEdges.x0);
			pixelEdges.y0 = toPixel($.get(context).yScale, dataEdges.y0);
			pixelEdges.x1 = toPixel($.get(context).xScale, dataEdges.x1);
			pixelEdges.y1 = toPixel($.get(context).yScale, dataEdges.y1);
		}

		previousValueMode = nextValueMode;
	});

	var fragment = root_3();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Field(node, {
		label: 'Mode',
		classes: { input: 'mt-[6px] mb-1' },
		children: ($$anchor, $$slotProps) => {
			ToggleGroup($$anchor, {
				variant: 'outline',
				size: 'sm',
				inset: true,
				class: 'w-full',
				get value() {
					return $.get(valueMode);
				},

				set value($$value) {
					$.set(valueMode, $$value, true);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					ToggleOption(node_1, {
						value: 'data',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('data');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					ToggleOption(node_2, {
						value: 'pixel',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('pixel');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node, 2);

	MenuField(node_3, {
		label: 'Props',
		get options() {
			return propsOptions;
		},
		stepper: true,
		classes: { menuIcon: 'hidden' },
		get value() {
			return $.get(propsMode);
		},

		set value($$value) {
			$.set(propsMode, $$value, true);
		}
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_4 = $.child(div_1);

	{
		var consequent = ($$anchor) => {
			var fragment_3 = root_1();
			var node_5 = $.first_child(fragment_3);

			RangeField(node_5, {
				label: 'x',
				min: 0,
				max: 360,
				get value() {
					return pixelPosition.x;
				},

				set value($$value) {
					pixelPosition.x = $$value;
				}
			});

			var node_6 = $.sibling(node_5, 2);

			RangeField(node_6, {
				label: 'y',
				min: 0,
				max: 220,
				get value() {
					return pixelPosition.y;
				},

				set value($$value) {
					pixelPosition.y = $$value;
				}
			});

			var node_7 = $.sibling(node_6, 2);

			RangeField(node_7, {
				label: 'width',
				min: 20,
				max: 360,
				get value() {
					return pixelPosition.width;
				},

				set value($$value) {
					pixelPosition.width = $$value;
				}
			});

			var node_8 = $.sibling(node_7, 2);

			RangeField(node_8, {
				label: 'height',
				min: 20,
				max: 240,
				get value() {
					return pixelPosition.height;
				},

				set value($$value) {
					pixelPosition.height = $$value;
				}
			});

			$.append($$anchor, fragment_3);
		};

		var consequent_1 = ($$anchor) => {
			var fragment_4 = root_1();
			var node_9 = $.first_child(fragment_4);

			RangeField(node_9, {
				label: 'x',
				min: 0,
				max: 100,
				get value() {
					return dataPosition.x;
				},

				set value($$value) {
					dataPosition.x = $$value;
				}
			});

			var node_10 = $.sibling(node_9, 2);

			RangeField(node_10, {
				label: 'y',
				min: 0,
				max: 100,
				get value() {
					return dataPosition.y;
				},

				set value($$value) {
					dataPosition.y = $$value;
				}
			});

			var node_11 = $.sibling(node_10, 2);

			RangeField(node_11, {
				label: 'width',
				min: 20,
				max: 360,
				get value() {
					return dataPosition.width;
				},

				set value($$value) {
					dataPosition.width = $$value;
				}
			});

			var node_12 = $.sibling(node_11, 2);

			RangeField(node_12, {
				label: 'height',
				min: 20,
				max: 240,
				get value() {
					return dataPosition.height;
				},

				set value($$value) {
					dataPosition.height = $$value;
				}
			});

			$.append($$anchor, fragment_4);
		};

		var consequent_2 = ($$anchor) => {
			var fragment_5 = root_1();
			var node_13 = $.first_child(fragment_5);

			RangeField(node_13, {
				label: 'x0',
				min: 0,
				max: 400,
				get value() {
					return pixelEdges.x0;
				},

				set value($$value) {
					pixelEdges.x0 = $$value;
				}
			});

			var node_14 = $.sibling(node_13, 2);

			RangeField(node_14, {
				label: 'y0',
				min: 0,
				max: 260,
				get value() {
					return pixelEdges.y0;
				},

				set value($$value) {
					pixelEdges.y0 = $$value;
				}
			});

			var node_15 = $.sibling(node_14, 2);

			RangeField(node_15, {
				label: 'x1',
				min: 0,
				max: 400,
				get value() {
					return pixelEdges.x1;
				},

				set value($$value) {
					pixelEdges.x1 = $$value;
				}
			});

			var node_16 = $.sibling(node_15, 2);

			RangeField(node_16, {
				label: 'y1',
				min: 0,
				max: 260,
				get value() {
					return pixelEdges.y1;
				},

				set value($$value) {
					pixelEdges.y1 = $$value;
				}
			});

			$.append($$anchor, fragment_5);
		};

		var alternate = ($$anchor) => {
			var fragment_6 = root_1();
			var node_17 = $.first_child(fragment_6);

			RangeField(node_17, {
				label: 'x0',
				min: 0,
				max: 100,
				get value() {
					return dataEdges.x0;
				},

				set value($$value) {
					dataEdges.x0 = $$value;
				}
			});

			var node_18 = $.sibling(node_17, 2);

			RangeField(node_18, {
				label: 'y0',
				min: 0,
				max: 100,
				get value() {
					return dataEdges.y0;
				},

				set value($$value) {
					dataEdges.y0 = $$value;
				}
			});

			var node_19 = $.sibling(node_18, 2);

			RangeField(node_19, {
				label: 'x1',
				min: 0,
				max: 100,
				get value() {
					return dataEdges.x1;
				},

				set value($$value) {
					dataEdges.x1 = $$value;
				}
			});

			var node_20 = $.sibling(node_19, 2);

			RangeField(node_20, {
				label: 'y1',
				min: 0,
				max: 100,
				get value() {
					return dataEdges.y1;
				},

				set value($$value) {
					dataEdges.y1 = $$value;
				}
			});

			$.append($$anchor, fragment_6);
		};

		$.if(node_4, ($$render) => {
			if ($.get(propsMode) === 'position-size' && $.get(valueMode) === 'pixel') $$render(consequent); else if ($.get(propsMode) === 'position-size') $$render(consequent_1, 1); else if ($.get(valueMode) === 'pixel') $$render(consequent_2, 2); else $$render(alternate, -1);
		});
	}

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_21 = $.child(div_2);

	RangeField(node_21, {
		label: 'topLeft',
		min: 0,
		max: 80,
		get value() {
			return corners.topLeft;
		},

		set value($$value) {
			corners.topLeft = $$value;
		}
	});

	var node_22 = $.sibling(node_21, 2);

	RangeField(node_22, {
		label: 'topRight',
		min: 0,
		max: 80,
		get value() {
			return corners.topRight;
		},

		set value($$value) {
			corners.topRight = $$value;
		}
	});

	var node_23 = $.sibling(node_22, 2);

	RangeField(node_23, {
		label: 'bottomRight',
		min: 0,
		max: 80,
		get value() {
			return corners.bottomRight;
		},

		set value($$value) {
			corners.bottomRight = $$value;
		}
	});

	var node_24 = $.sibling(node_23, 2);

	RangeField(node_24, {
		label: 'bottomLeft',
		min: 0,
		max: 80,
		get value() {
			return corners.bottomLeft;
		},

		set value($$value) {
			corners.bottomLeft = $$value;
		}
	});

	$.reset(div_2);

	var node_25 = $.sibling(div_2, 2);

	Chart(node_25, {
		get data() {
			return $.get(data);
		},

		get x() {
			return $.get(x);
		},

		get y() {
			return $.get(y);
		},
		xDomain: [0, 100],
		yDomain: [0, 100],
		padding: { top: 16, right: 16, bottom: 24, left: 28 },
		height: 340,
		get context() {
			return $.get(context);
		},

		set context($$value) {
			$.set(context, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_8 = root_2();
					var node_26 = $.first_child(fragment_8);

					Axis(node_26, { placement: 'bottom', rule: true });

					var node_27 = $.sibling(node_26, 2);

					Axis(node_27, { placement: 'left', rule: true });

					var node_28 = $.sibling(node_27, 2);

					{
						var consequent_3 = ($$anchor) => {
							Rect($$anchor, $.spread_props(() => pixelPosition, {
								get corners() {
									return corners;
								},
								fill: 'var(--color-primary)'
							}));
						};

						var consequent_4 = ($$anchor) => {
							Rect($$anchor, {
								x: 'x',
								y: 'y',
								width: 'width',
								height: 'height',
								get corners() {
									return corners;
								},
								fill: 'var(--color-primary)'
							});
						};

						var consequent_5 = ($$anchor) => {
							Rect($$anchor, $.spread_props(() => pixelEdges, {
								get corners() {
									return corners;
								},
								fill: 'var(--color-primary)'
							}));
						};

						var alternate_1 = ($$anchor) => {
							Rect($$anchor, {
								x0: 'x0',
								y0: 'y0',
								x1: 'x1',
								y1: 'y1',
								get corners() {
									return corners;
								},
								fill: 'var(--color-primary)'
							});
						};

						$.if(node_28, ($$render) => {
							if ($.get(propsMode) === 'position-size' && $.get(valueMode) === 'pixel') $$render(consequent_3); else if ($.get(propsMode) === 'position-size') $$render(consequent_4, 1); else if ($.get(valueMode) === 'pixel') $$render(consequent_5, 2); else $$render(alternate_1, -1);
						});
					}

					$.append($$anchor, fragment_8);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}
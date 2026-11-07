import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Vector, Polygon, Layer, Text } from 'layerchart';
import { Field, RangeField, ToggleGroup, ToggleOption } from 'svelte-ux';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_svg(`<line class="stroke-success"></line><circle class="fill-success"></circle>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<div class="grid gap-2 mb-2 screenshot-hidden"><div class="grid grid-cols-3 gap-3"><!> <!> <!></div> <!></div> <!>`, 1);

export default function Shapes($$anchor) {
	let length = $.state(30);
	let rotate = $.state(30);
	let width = $.state(8);
	let anchor = $.state('middle');
	var fragment = root_3();
	var div = $.first_child(fragment);
	var div_1 = $.child(div);
	var node = $.child(div_1);

	RangeField(node, {
		label: 'Length',
		min: 10,
		max: 60,
		step: 1,
		get value() {
			return $.get(length);
		},

		set value($$value) {
			$.set(length, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	RangeField(node_1, {
		label: 'Width',
		min: 1,
		max: 30,
		step: 1,
		get value() {
			return $.get(width);
		},

		set value($$value) {
			$.set(width, $$value, true);
		}
	});

	var node_2 = $.sibling(node_1, 2);

	RangeField(node_2, {
		label: 'Rotate',
		min: 0,
		max: 360,
		step: 1,
		get value() {
			return $.get(rotate);
		},

		set value($$value) {
			$.set(rotate, $$value, true);
		}
	});

	$.reset(div_1);

	var node_3 = $.sibling(div_1, 2);

	Field(node_3, {
		label: 'Anchor',
		children: ($$anchor, $$slotProps) => {
			ToggleGroup($$anchor, {
				variant: 'outline',
				size: 'sm',
				inset: true,
				class: 'w-full',
				get value() {
					return $.get(anchor);
				},

				set value($$value) {
					$.set(anchor, $$value, true);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_4 = $.first_child(fragment_2);

					ToggleOption(node_4, {
						value: 'start',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('start');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					ToggleOption(node_5, {
						value: 'middle',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('middle');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_5, 2);

					ToggleOption(node_6, {
						value: 'end',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('end');

							$.append($$anchor, text_2);
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

	$.reset(div);

	var node_7 = $.sibling(div, 2);

	Chart(node_7, {
		padding: { top: 20, bottom: 10, left: 10, right: 10 },
		height: 300,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_2();
					var node_8 = $.first_child(fragment_4);

					Text(node_8, {
						x: 45,
						y: 16,
						textAnchor: 'middle',
						class: 'text-xs fill-surface-content/50',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('arrow');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					var node_9 = $.sibling(node_8, 2);

					Vector(node_9, {
						x: 45,
						y: 120,
						get length() {
							return $.get(length);
						},

						get rotate() {
							return $.get(rotate);
						},

						get anchor() {
							return $.get(anchor);
						},
						class: 'stroke-primary'
					});

					var node_10 = $.sibling(node_9, 2);

					Text(node_10, {
						x: 125,
						y: 16,
						textAnchor: 'middle',
						class: 'text-xs fill-surface-content/50',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('arrow (width)');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					var node_11 = $.sibling(node_10, 2);

					Vector(node_11, {
						x: 125,
						y: 120,
						get length() {
							return $.get(length);
						},

						get rotate() {
							return $.get(rotate);
						},

						get width() {
							return $.get(width);
						},

						get anchor() {
							return $.get(anchor);
						},
						class: 'stroke-secondary'
					});

					var node_12 = $.sibling(node_11, 2);

					Text(node_12, {
						x: 215,
						y: 16,
						textAnchor: 'middle',
						class: 'text-xs fill-surface-content/50',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('spike');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});

					var node_13 = $.sibling(node_12, 2);

					Vector(node_13, {
						x: 215,
						y: 120,
						get length() {
							return $.get(length);
						},

						get rotate() {
							return $.get(rotate);
						},

						get anchor() {
							return $.get(anchor);
						},
						shape: 'spike',
						class: 'stroke-danger fill-danger/25'
					});

					var node_14 = $.sibling(node_13, 2);

					Text(node_14, {
						x: 305,
						y: 16,
						textAnchor: 'middle',
						class: 'text-xs fill-surface-content/50',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text('spike (width)');

							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});

					var node_15 = $.sibling(node_14, 2);

					Vector(node_15, {
						x: 305,
						y: 120,
						get length() {
							return $.get(length);
						},

						get rotate() {
							return $.get(rotate);
						},

						get anchor() {
							return $.get(anchor);
						},
						shape: 'spike',
						get width() {
							return $.get(width);
						},
						class: 'stroke-danger fill-danger/25'
					});

					var node_16 = $.sibling(node_15, 2);

					Text(node_16, {
						x: 395,
						y: 16,
						textAnchor: 'middle',
						class: 'text-xs fill-surface-content/50',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_7 = $.text('custom');

							$.append($$anchor, text_7);
						},
						$$slots: { default: true }
					});

					var node_17 = $.sibling(node_16, 2);

					{
						const children = ($$anchor, $$arg0) => {
							let len = () => ($$arg0?.()).length;
							var fragment_5 = root_1();
							var line = $.first_child(fragment_5);

							$.set_attribute(line, 'x1', 0);
							$.set_attribute(line, 'y1', 0);
							$.set_attribute(line, 'x2', 0);
							$.set_attribute(line, 'stroke-width', 2);

							var circle = $.sibling(line);

							$.set_attribute(circle, 'cx', 0);
							$.set_attribute(circle, 'r', 4);

							$.template_effect(() => {
								$.set_attribute(line, 'y2', -len());
								$.set_attribute(circle, 'cy', -len());
							});

							$.append($$anchor, fragment_5);
						};

						Vector(node_17, {
							x: 395,
							y: 120,
							get length() {
								return $.get(length);
							},

							get rotate() {
								return $.get(rotate);
							},

							get anchor() {
								return $.get(anchor);
							},
							children,
							$$slots: { default: true }
						});
					}

					var node_18 = $.sibling(node_17, 2);

					Text(node_18, {
						x: 480,
						y: 16,
						textAnchor: 'middle',
						class: 'text-xs fill-surface-content/50',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_8 = $.text('Polygon arrow');

							$.append($$anchor, text_8);
						},
						$$slots: { default: true }
					});

					var node_19 = $.sibling(node_18, 2);

					{
						const children = ($$anchor, $$arg0) => {
							let len = () => ($$arg0?.()).length;
							const s = $.derived(() => len() / 2);

							{
								let $0 = $.derived(() => [
									{ x: 0, y: -$.get(s) },
									{ x: -$.get(s) / 2, y: 0 },
									{ x: -$.get(s) / 4, y: 0 },
									{ x: -$.get(s) / 4, y: $.get(s) },
									{ x: $.get(s) / 4, y: $.get(s) },
									{ x: $.get(s) / 4, y: 0 },
									{ x: $.get(s) / 2, y: 0 },
									{ x: 0, y: -$.get(s) }
								]);

								Polygon($$anchor, {
									get points() {
										return $.get($0);
									},
									class: 'fill-warning/50 stroke-warning'
								});
							}
						};

						Vector(node_19, {
							x: 480,
							y: 120,
							get length() {
								return $.get(length);
							},

							get rotate() {
								return $.get(rotate);
							},

							get anchor() {
								return $.get(anchor);
							},
							children,
							$$slots: { default: true }
						});
					}

					var node_20 = $.sibling(node_19, 2);

					Text(node_20, {
						x: 570,
						y: 16,
						textAnchor: 'middle',
						class: 'text-xs fill-surface-content/50',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_9 = $.text('Polygon star');

							$.append($$anchor, text_9);
						},
						$$slots: { default: true }
					});

					var node_21 = $.sibling(node_20, 2);

					{
						const children = ($$anchor, $$arg0) => {
							let len = () => ($$arg0?.()).length;

							{
								let $0 = $.derived(() => len() * 0.35);

								Polygon($$anchor, {
									get r() {
										return $.get($0);
									},
									points: 6,
									inset: 0.7,
									rotate: 30,
									class: 'fill-info/50 stroke-info'
								});
							}
						};

						Vector(node_21, {
							x: 570,
							y: 120,
							get length() {
								return $.get(length);
							},

							get rotate() {
								return $.get(rotate);
							},

							get anchor() {
								return $.get(anchor);
							},
							children,
							$$slots: { default: true }
						});
					}

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}
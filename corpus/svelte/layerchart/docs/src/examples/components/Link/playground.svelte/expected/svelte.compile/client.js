import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Link, Chart, Circle, Layer } from 'layerchart';
import LinkPlaygroundControls from '$lib/components/controls/LinkControls.svelte';
import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';
import { movable } from '$lib/attachments/movable.js';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Playground($$anchor, $$props) {
	$.push($$props, true);

	let source = $.proxy({ x: 300, y: 150 });
	let middle = $.proxy({ x: 420, y: 240 });
	let target = $.proxy({ x: 500, y: 300 });
	let showMiddle = $.state(false);
	let type = $.state('d3');
	let curve = $.state(undefined);
	let sweep = $.state('horizontal-vertical');
	let orientation = $.state('horizontal');
	let radius = $.state(60);
	let bend = $.state(22.5);
	var fragment = root();
	var node = $.first_child(fragment);

	LinkPlaygroundControls(node, {
		get type() {
			return $.get(type);
		},

		set type($$value) {
			$.set(type, $$value, true);
		},

		get curve() {
			return $.get(curve);
		},

		set curve($$value) {
			$.set(curve, $$value, true);
		},

		get sweep() {
			return $.get(sweep);
		},

		set sweep($$value) {
			$.set(sweep, $$value, true);
		},

		get orientation() {
			return $.get(orientation);
		},

		set orientation($$value) {
			$.set(orientation, $$value, true);
		},

		get radius() {
			return $.get(radius);
		},

		set radius($$value) {
			$.set(radius, $$value, true);
		},

		get bend() {
			return $.get(bend);
		},

		set bend($$value) {
			$.set(bend, $$value, true);
		},

		get showMiddle() {
			return $.get(showMiddle);
		},

		set showMiddle($$value) {
			$.set(showMiddle, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	Chart(node_1, {
		padding: { left: 16, bottom: 24 },
		height: 400,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node_2 = $.first_child(fragment_2);

					{
						var consequent = ($$anchor) => {
							var fragment_3 = root();
							var node_3 = $.first_child(fragment_3);

							Link(node_3, {
								get x1() {
									return source.x;
								},

								get y1() {
									return source.y;
								},

								get x2() {
									return middle.x;
								},

								get y2() {
									return middle.y;
								},

								get sweep() {
									return $.get(sweep);
								},

								get type() {
									return $.get(type);
								},

								get radius() {
									return $.get(radius);
								},

								get bend() {
									return $.get(bend);
								},

								get curve() {
									return $.get(curve);
								},

								get orientation() {
									return $.get(orientation);
								},
								class: 'stroke-primary stroke-4'
							});

							var node_4 = $.sibling(node_3, 2);

							Link(node_4, {
								get x1() {
									return middle.x;
								},

								get y1() {
									return middle.y;
								},

								get x2() {
									return target.x;
								},

								get y2() {
									return target.y;
								},

								get sweep() {
									return $.get(sweep);
								},

								get type() {
									return $.get(type);
								},

								get radius() {
									return $.get(radius);
								},

								get bend() {
									return $.get(bend);
								},

								get curve() {
									return $.get(curve);
								},

								get orientation() {
									return $.get(orientation);
								},
								class: 'stroke-primary stroke-4'
							});

							$.append($$anchor, fragment_3);
						};

						var alternate = ($$anchor) => {
							Link($$anchor, {
								get x1() {
									return source.x;
								},

								get y1() {
									return source.y;
								},

								get x2() {
									return target.x;
								},

								get y2() {
									return target.y;
								},

								get sweep() {
									return $.get(sweep);
								},

								get type() {
									return $.get(type);
								},

								get radius() {
									return $.get(radius);
								},

								get bend() {
									return $.get(bend);
								},

								get curve() {
									return $.get(curve);
								},

								get orientation() {
									return $.get(orientation);
								},
								class: 'stroke-primary stroke-4'
							});
						};

						$.if(node_2, ($$render) => {
							if ($.get(showMiddle)) $$render(consequent); else $$render(alternate, -1);
						});
					}

					var node_5 = $.sibling(node_2, 2);

					Circle(node_5, {
						get cx() {
							return source.x;
						},

						get cy() {
							return source.y;
						},
						r: 10,
						class: 'cursor-grab fill-surface-200 stroke-4 stroke-info',
						[$.attachment()]: ($$node) => (movable({
							onMove: ({ dx, dy }) => {
								source.x += dx;
								source.y += dy;
							}
						}) || $.noop)($$node)
					});

					var node_6 = $.sibling(node_5, 2);

					{
						var consequent_1 = ($$anchor) => {
							Circle($$anchor, {
								get cx() {
									return middle.x;
								},

								get cy() {
									return middle.y;
								},
								r: 10,
								class: 'cursor-grab fill-primary/50',
								[$.attachment()]: ($$node) => (movable({
									onMove: ({ dx, dy }) => {
										middle.x += dx;
										middle.y += dy;
									}
								}) || $.noop)($$node)
							});
						};

						$.if(node_6, ($$render) => {
							if ($.get(showMiddle)) $$render(consequent_1);
						});
					}

					var node_7 = $.sibling(node_6, 2);

					Circle(node_7, {
						get cx() {
							return target.x;
						},

						get cy() {
							return target.y;
						},
						r: 10,
						class: 'cursor-grab fill-surface-200 stroke-4 stroke-accent',
						[$.attachment()]: ($$node) => (movable({
							onMove: ({ dx, dy }) => {
								target.x += dx;
								target.y += dy;
							}
						}) || $.noop)($$node)
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}
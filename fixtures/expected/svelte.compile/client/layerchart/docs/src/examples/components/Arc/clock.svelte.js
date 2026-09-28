import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Circle, Group, Layer, Line, Text } from 'layerchart';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Clock($$anchor, $$props) {
	$.push($$props, true);

	let now = $.state($.proxy(new Date()));

	$.user_effect(() => {
		const interval = setInterval(
			() => {
				$.set(now, new Date(), true);
			},
			1000
		);

		return () => clearInterval(interval);
	});

	const hours = $.derived(() => $.get(now).getHours() % 12);
	const minutes = $.derived(() => $.get(now).getMinutes());
	const seconds = $.derived(() => $.get(now).getSeconds());

	// Angles in radians (clock: 12 o'clock = 0 degrees, clockwise)
	const secondAngleRad = $.derived(() => $.get(seconds) * 6 * Math.PI / 180);

	const minuteAngleRad = $.derived(() => ($.get(minutes) * 6 + $.get(seconds) * 0.1) * Math.PI / 180);
	const hourAngleRad = $.derived(() => ($.get(hours) * 30 + $.get(minutes) * 0.5) * Math.PI / 180);
	const hourMarkers = Array.from({ length: 12 }, (_, i) => i);
	const minuteMarkers = Array.from({ length: 60 }, (_, i) => i).filter((i) => i % 5 !== 0);
	const hourLabels = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

	Chart($$anchor, {
		height: 260,
		padding: 10,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				center: true,
				children: ($$anchor, $$slotProps) => {
					Group($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node = $.first_child(fragment_3);

							Circle(node, {
								r: 100,
								class: 'fill-surface-200 stroke-surface-content/20',
								strokeWidth: 2
							});

							var node_1 = $.sibling(node, 2);

							$.each(node_1, 16, () => minuteMarkers, (i) => i, ($$anchor, i) => {
								const angleRad = $.derived(() => i * 6 * Math.PI / 180);

								{
									let $0 = $.derived(() => Math.sin($.get(angleRad)) * 90);
									let $1 = $.derived(() => -Math.cos($.get(angleRad)) * 90);
									let $2 = $.derived(() => Math.sin($.get(angleRad)) * 95);
									let $3 = $.derived(() => -Math.cos($.get(angleRad)) * 95);

									Line($$anchor, {
										get x1() {
											return $.get($0);
										},

										get y1() {
											return $.get($1);
										},

										get x2() {
											return $.get($2);
										},

										get y2() {
											return $.get($3);
										},
										class: 'stroke-surface-content/20',
										strokeWidth: 1
									});
								}
							});

							var node_2 = $.sibling(node_1, 2);

							$.each(node_2, 16, () => hourMarkers, (i) => i, ($$anchor, i) => {
								const angleRad = $.derived(() => i * 30 * Math.PI / 180);

								{
									let $0 = $.derived(() => Math.sin($.get(angleRad)) * 85);
									let $1 = $.derived(() => -Math.cos($.get(angleRad)) * 85);
									let $2 = $.derived(() => Math.sin($.get(angleRad)) * 95);
									let $3 = $.derived(() => -Math.cos($.get(angleRad)) * 95);

									Line($$anchor, {
										get x1() {
											return $.get($0);
										},

										get y1() {
											return $.get($1);
										},

										get x2() {
											return $.get($2);
										},

										get y2() {
											return $.get($3);
										},
										class: 'stroke-surface-content',
										strokeWidth: 2.5
									});
								}
							});

							var node_3 = $.sibling(node_2, 2);

							$.each(node_3, 18, () => hourLabels, (label) => label, ($$anchor, label, i) => {
								const angleRad = $.derived(() => $.get(i) * 30 * Math.PI / 180);

								{
									let $0 = $.derived(() => Math.sin($.get(angleRad)) * 75);
									let $1 = $.derived(() => -Math.cos($.get(angleRad)) * 75);
									let $2 = $.derived(() => String(label));

									Text($$anchor, {
										get x() {
											return $.get($0);
										},

										get y() {
											return $.get($1);
										},

										get value() {
											return $.get($2);
										},
										textAnchor: 'middle',
										verticalAnchor: 'middle',
										class: 'text-xs font-semibold fill-surface-content tabular-nums'
									});
								}
							});

							var node_4 = $.sibling(node_3, 2);

							{
								let $0 = $.derived(() => Math.sin($.get(hourAngleRad)) * -8);
								let $1 = $.derived(() => -Math.cos($.get(hourAngleRad)) * -8);
								let $2 = $.derived(() => Math.sin($.get(hourAngleRad)) * 52);
								let $3 = $.derived(() => -Math.cos($.get(hourAngleRad)) * 52);

								Line(node_4, {
									get x1() {
										return $.get($0);
									},

									get y1() {
										return $.get($1);
									},

									get x2() {
										return $.get($2);
									},

									get y2() {
										return $.get($3);
									},
									class: 'stroke-surface-content',
									strokeWidth: 4
								});
							}

							var node_5 = $.sibling(node_4, 2);

							{
								let $0 = $.derived(() => Math.sin($.get(minuteAngleRad)) * -10);
								let $1 = $.derived(() => -Math.cos($.get(minuteAngleRad)) * -10);
								let $2 = $.derived(() => Math.sin($.get(minuteAngleRad)) * 70);
								let $3 = $.derived(() => -Math.cos($.get(minuteAngleRad)) * 70);

								Line(node_5, {
									get x1() {
										return $.get($0);
									},

									get y1() {
										return $.get($1);
									},

									get x2() {
										return $.get($2);
									},

									get y2() {
										return $.get($3);
									},
									class: 'stroke-surface-content',
									strokeWidth: 2.5
								});
							}

							var node_6 = $.sibling(node_5, 2);

							{
								let $0 = $.derived(() => Math.sin($.get(secondAngleRad)) * -14);
								let $1 = $.derived(() => -Math.cos($.get(secondAngleRad)) * -14);
								let $2 = $.derived(() => Math.sin($.get(secondAngleRad)) * 80);
								let $3 = $.derived(() => -Math.cos($.get(secondAngleRad)) * 80);

								Line(node_6, {
									get x1() {
										return $.get($0);
									},

									get y1() {
										return $.get($1);
									},

									get x2() {
										return $.get($2);
									},

									get y2() {
										return $.get($3);
									},
									class: 'stroke-red-500',
									strokeWidth: 1
								});
							}

							var node_7 = $.sibling(node_6, 2);

							Circle(node_7, { r: 4, class: 'fill-red-500' });

							var node_8 = $.sibling(node_7, 2);

							Circle(node_8, { r: 2, class: 'fill-surface-content' });
							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.pop();
}
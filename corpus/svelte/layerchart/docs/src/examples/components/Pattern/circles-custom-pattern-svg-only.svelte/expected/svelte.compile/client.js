import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Layer, Pattern } from 'layerchart';

var root = $.from_svg(`<circle class="fill-surface-content"></circle>`);
var root_1 = $.from_svg(`<circle class="fill-surface-content"></circle><circle class="fill-surface-content"></circle><circle class="fill-surface-content"></circle><circle class="fill-surface-content"></circle><circle class="fill-surface-content"></circle>`, 1);
var root_2 = $.from_svg(`<circle class="fill-surface-content/30"></circle>`);
var root_3 = $.from_svg(`<rect class="stroke-surface-content"></rect>`);
var root_4 = $.from_svg(`<!><!><!><!><!><!><!>`, 1);

export default function Circles_custom_pattern_svg_only($$anchor) {
	Chart($$anchor, {
		height: 300,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_4();
					var node = $.first_child(fragment_2);

					{
						const patternContent = ($$anchor) => {
							var circle = root();

							$.set_attribute(circle, 'cx', 2);
							$.set_attribute(circle, 'cy', 2);
							$.set_attribute(circle, 'r', 1);
							$.append($$anchor, circle);
						};

						Pattern(node, {
							id: 'circle-pattern-1',
							width: 4,
							height: 4,
							patternContent,
							$$slots: { patternContent: true }
						});
					}

					var node_1 = $.sibling(node);

					{
						const patternContent = ($$anchor) => {
							var circle_1 = root();

							$.set_attribute(circle_1, 'cx', 4);
							$.set_attribute(circle_1, 'cy', 4);
							$.set_attribute(circle_1, 'r', 1);
							$.append($$anchor, circle_1);
						};

						Pattern(node_1, {
							id: 'circle-pattern-2',
							width: 8,
							height: 8,
							patternContent,
							$$slots: { patternContent: true }
						});
					}

					var node_2 = $.sibling(node_1);

					{
						const patternContent = ($$anchor) => {
							var circle_2 = root();

							$.set_attribute(circle_2, 'cx', 4);
							$.set_attribute(circle_2, 'cy', 4);
							$.set_attribute(circle_2, 'r', 2);
							$.append($$anchor, circle_2);
						};

						Pattern(node_2, {
							id: 'circle-pattern-3',
							width: 8,
							height: 8,
							patternContent,
							$$slots: { patternContent: true }
						});
					}

					var node_3 = $.sibling(node_2);

					{
						const patternContent = ($$anchor) => {
							var fragment_3 = root_1();
							var circle_3 = $.first_child(fragment_3);

							$.set_attribute(circle_3, 'cx', 4);
							$.set_attribute(circle_3, 'cy', 4);
							$.set_attribute(circle_3, 'r', 2);

							var circle_4 = $.sibling(circle_3);

							$.set_attribute(circle_4, 'cx', 0);
							$.set_attribute(circle_4, 'cy', 0);
							$.set_attribute(circle_4, 'r', 2);

							var circle_5 = $.sibling(circle_4);

							$.set_attribute(circle_5, 'cx', 0);
							$.set_attribute(circle_5, 'cy', 8);
							$.set_attribute(circle_5, 'r', 2);

							var circle_6 = $.sibling(circle_5);

							$.set_attribute(circle_6, 'cx', 8);
							$.set_attribute(circle_6, 'cy', 0);
							$.set_attribute(circle_6, 'r', 2);

							var circle_7 = $.sibling(circle_6);

							$.set_attribute(circle_7, 'cx', 8);
							$.set_attribute(circle_7, 'cy', 8);
							$.set_attribute(circle_7, 'r', 2);
							$.append($$anchor, fragment_3);
						};

						Pattern(node_3, {
							id: 'circle-pattern-4',
							width: 8,
							height: 8,
							patternContent,
							$$slots: { patternContent: true }
						});
					}

					var node_4 = $.sibling(node_3);

					{
						const patternContent = ($$anchor) => {
							var fragment_4 = root_1();
							var circle_8 = $.first_child(fragment_4);

							$.set_attribute(circle_8, 'cx', 4);
							$.set_attribute(circle_8, 'cy', 4);
							$.set_attribute(circle_8, 'r', 1);

							var circle_9 = $.sibling(circle_8);

							$.set_attribute(circle_9, 'cx', 0);
							$.set_attribute(circle_9, 'cy', 0);
							$.set_attribute(circle_9, 'r', 1);

							var circle_10 = $.sibling(circle_9);

							$.set_attribute(circle_10, 'cx', 0);
							$.set_attribute(circle_10, 'cy', 8);
							$.set_attribute(circle_10, 'r', 1);

							var circle_11 = $.sibling(circle_10);

							$.set_attribute(circle_11, 'cx', 8);
							$.set_attribute(circle_11, 'cy', 0);
							$.set_attribute(circle_11, 'r', 1);

							var circle_12 = $.sibling(circle_11);

							$.set_attribute(circle_12, 'cx', 8);
							$.set_attribute(circle_12, 'cy', 8);
							$.set_attribute(circle_12, 'r', 1);
							$.append($$anchor, fragment_4);
						};

						Pattern(node_4, {
							id: 'circle-pattern-5',
							width: 8,
							height: 8,
							patternContent,
							$$slots: { patternContent: true }
						});
					}

					var node_5 = $.sibling(node_4);

					{
						const patternContent = ($$anchor) => {
							var circle_13 = root_2();

							$.set_attribute(circle_13, 'cx', 4);
							$.set_attribute(circle_13, 'cy', 4);
							$.set_attribute(circle_13, 'r', 2);
							$.append($$anchor, circle_13);
						};

						Pattern(node_5, {
							id: 'circle-pattern-6',
							width: 8,
							height: 8,
							patternContent,
							$$slots: { patternContent: true }
						});
					}

					var node_6 = $.sibling(node_5);

					$.each(node_6, 16, () => ({ length: 6 }), $.index, ($$anchor, _, i) => {
						var rect = root_3();

						$.set_attribute(rect, 'x', 0 + i * 120);
						$.set_attribute(rect, 'y', 0);
						$.set_attribute(rect, 'width', 100);
						$.set_attribute(rect, 'height', 300);
						$.set_attribute(rect, 'rx', 8);
						$.set_attribute(rect, 'fill', `url(#circle-pattern-${i + 1})`);
						$.append($$anchor, rect);
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}
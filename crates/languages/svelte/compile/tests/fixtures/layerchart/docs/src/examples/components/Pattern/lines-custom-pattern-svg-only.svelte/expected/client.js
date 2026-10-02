import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Layer, Pattern } from 'layerchart';

var root = $.from_svg(`<line x2="100%" class="stroke-surface-content"></line>`);
var root_1 = $.from_svg(`<rect class="stroke-surface-content"></rect>`);
var root_2 = $.from_svg(`<line y2="100%" class="stroke-surface-content"></line>`);
var root_3 = $.from_svg(`<line x2="100%" class="stroke-surface-content"></line><line y2="100%" class="stroke-surface-content"></line>`, 1);
var root_4 = $.from_svg(`<line class="stroke-surface-content"></line>`);
var root_5 = $.from_svg(`<line class="stroke-surface-content"></line><line class="stroke-surface-content"></line>`, 1);
var root_6 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Lines_custom_pattern_svg_only($$anchor) {
	Chart($$anchor, {
		height: 300,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_6();
					var node = $.first_child(fragment_2);

					{
						const patternContent = ($$anchor) => {
							var line = root();

							$.append($$anchor, line);
						};

						const children = ($$anchor, $$arg0) => {
							let pattern = () => ($$arg0?.()).pattern;
							var rect = root_1();

							$.set_attribute(rect, 'x', 120 * 0);
							$.set_attribute(rect, 'y', 0);
							$.set_attribute(rect, 'width', 100);
							$.set_attribute(rect, 'height', 300);
							$.set_attribute(rect, 'rx', 8);
							$.template_effect(() => $.set_attribute(rect, 'fill', pattern()));
							$.append($$anchor, rect);
						};

						Pattern(node, {
							width: 4,
							height: 4,
							patternContent,
							children,
							$$slots: { patternContent: true, default: true }
						});
					}

					var node_1 = $.sibling(node, 2);

					{
						const patternContent = ($$anchor) => {
							var line_1 = root_2();

							$.append($$anchor, line_1);
						};

						const children = ($$anchor, $$arg0) => {
							let pattern = () => ($$arg0?.()).pattern;
							var rect_1 = root_1();

							$.set_attribute(rect_1, 'x', 120 * 1);
							$.set_attribute(rect_1, 'y', 0);
							$.set_attribute(rect_1, 'width', 100);
							$.set_attribute(rect_1, 'height', 300);
							$.set_attribute(rect_1, 'rx', 8);
							$.template_effect(() => $.set_attribute(rect_1, 'fill', pattern()));
							$.append($$anchor, rect_1);
						};

						Pattern(node_1, {
							width: 4,
							height: 4,
							patternContent,
							children,
							$$slots: { patternContent: true, default: true }
						});
					}

					var node_2 = $.sibling(node_1, 2);

					{
						const patternContent = ($$anchor) => {
							var fragment_3 = root_3();

							$.next();
							$.append($$anchor, fragment_3);
						};

						const children = ($$anchor, $$arg0) => {
							let pattern = () => ($$arg0?.()).pattern;
							var rect_2 = root_1();

							$.set_attribute(rect_2, 'x', 120 * 2);
							$.set_attribute(rect_2, 'y', 0);
							$.set_attribute(rect_2, 'width', 100);
							$.set_attribute(rect_2, 'height', 300);
							$.set_attribute(rect_2, 'rx', 8);
							$.template_effect(() => $.set_attribute(rect_2, 'fill', pattern()));
							$.append($$anchor, rect_2);
						};

						Pattern(node_2, {
							width: 4,
							height: 4,
							patternContent,
							children,
							$$slots: { patternContent: true, default: true }
						});
					}

					var node_3 = $.sibling(node_2, 2);

					{
						const patternContent = ($$anchor) => {
							var line_2 = root_4();

							$.set_attribute(line_2, 'x1', 8);
							$.set_attribute(line_2, 'y2', 8);
							$.append($$anchor, line_2);
						};

						const children = ($$anchor, $$arg0) => {
							let pattern = () => ($$arg0?.()).pattern;
							var rect_3 = root_1();

							$.set_attribute(rect_3, 'x', 120 * 3);
							$.set_attribute(rect_3, 'y', 0);
							$.set_attribute(rect_3, 'width', 100);
							$.set_attribute(rect_3, 'height', 300);
							$.set_attribute(rect_3, 'rx', 8);
							$.template_effect(() => $.set_attribute(rect_3, 'fill', pattern()));
							$.append($$anchor, rect_3);
						};

						Pattern(node_3, {
							width: 8,
							height: 8,
							patternContent,
							children,
							$$slots: { patternContent: true, default: true }
						});
					}

					var node_4 = $.sibling(node_3, 2);

					{
						const patternContent = ($$anchor) => {
							var line_3 = root_4();

							$.set_attribute(line_3, 'x2', 8);
							$.set_attribute(line_3, 'y2', 8);
							$.append($$anchor, line_3);
						};

						const children = ($$anchor, $$arg0) => {
							let pattern = () => ($$arg0?.()).pattern;
							var rect_4 = root_1();

							$.set_attribute(rect_4, 'x', 120 * 4);
							$.set_attribute(rect_4, 'y', 0);
							$.set_attribute(rect_4, 'width', 100);
							$.set_attribute(rect_4, 'height', 300);
							$.set_attribute(rect_4, 'rx', 8);
							$.template_effect(() => $.set_attribute(rect_4, 'fill', pattern()));
							$.append($$anchor, rect_4);
						};

						Pattern(node_4, {
							width: 8,
							height: 8,
							patternContent,
							children,
							$$slots: { patternContent: true, default: true }
						});
					}

					var node_5 = $.sibling(node_4, 2);

					{
						const patternContent = ($$anchor) => {
							var fragment_4 = root_5();
							var line_4 = $.first_child(fragment_4);

							$.set_attribute(line_4, 'x1', 8);
							$.set_attribute(line_4, 'y2', 8);

							var line_5 = $.sibling(line_4);

							$.set_attribute(line_5, 'x2', 8);
							$.set_attribute(line_5, 'y2', 8);
							$.append($$anchor, fragment_4);
						};

						const children = ($$anchor, $$arg0) => {
							let pattern = () => ($$arg0?.()).pattern;
							var rect_5 = root_1();

							$.set_attribute(rect_5, 'x', 120 * 5);
							$.set_attribute(rect_5, 'y', 0);
							$.set_attribute(rect_5, 'width', 100);
							$.set_attribute(rect_5, 'height', 300);
							$.set_attribute(rect_5, 'rx', 8);
							$.template_effect(() => $.set_attribute(rect_5, 'fill', pattern()));
							$.append($$anchor, rect_5);
						};

						Pattern(node_5, {
							width: 8,
							height: 8,
							patternContent,
							children,
							$$slots: { patternContent: true, default: true }
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}
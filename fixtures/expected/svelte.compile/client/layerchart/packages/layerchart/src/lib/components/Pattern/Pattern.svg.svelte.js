import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { extractLayerProps } from '$lib/utils/attributes.js';
import { createId } from '$lib/utils/createId.js';
import { buildPatternShapes } from './Pattern.shared.svelte.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'id',
	'size',
	'width',
	'height',
	'lines',
	'circles',
	'rects',
	'background',
	'patternContent',
	'children'
]);

var root = $.from_svg(`<rect></rect>`);
var root_1 = $.from_svg(`<path fill="none"></path>`);
var root_2 = $.from_svg(`<circle></circle>`);
var root_3 = $.from_svg(`<!><!><!><!>`, 1);
var root_4 = $.from_svg(`<defs><pattern><!></pattern></defs><!>`, 1);

export default function Pattern_svg($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => createId('pattern-', uid)),
		size = $.prop($$props, 'size', 3, 4),
		width = $.prop($$props, 'width', 19, size),
		height = $.prop($$props, 'height', 19, size),
		rest = $.rest_props($$props, rest_excludes);

	const shapes = $.derived(() => buildPatternShapes($$props.lines, $$props.circles, size(), width(), height(), $$props.rects));
	var fragment = root_4();
	var defs = $.first_child(fragment);
	var pattern = $.child(defs);

	$.attribute_effect(
		pattern,
		($0) => ({
			id: id(),
			width: width(),
			height: height(),
			patternUnits: 'userSpaceOnUse',
			...$0
		}),
		[() => extractLayerProps(rest, 'lc-pattern')]
	);

	var node = $.child(pattern);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.patternContent ?? $.noop);
			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var fragment_2 = root_3();
			var node_2 = $.first_child(fragment_2);

			{
				var consequent_1 = ($$anchor) => {
					var rect_1 = root();

					$.template_effect(() => {
						$.set_attribute(rect_1, 'width', width());
						$.set_attribute(rect_1, 'height', height());
						$.set_attribute(rect_1, 'fill', $$props.background);
					});

					$.append($$anchor, rect_1);
				};

				$.if(node_2, ($$render) => {
					if ($$props.background) $$render(consequent_1);
				});
			}

			var node_3 = $.sibling(node_2);

			$.each(node_3, 17, () => $.get(shapes).filter((s) => s.type === 'line'), $.index, ($$anchor, line) => {
				var path = root_1();

				$.template_effect(() => {
					$.set_attribute(path, 'd', $.get(line).path);
					$.set_attribute(path, 'stroke', $.get(line).stroke);
					$.set_attribute(path, 'stroke-width', $.get(line).strokeWidth);
					$.set_attribute(path, 'opacity', $.get(line).opacity);
				});

				$.append($$anchor, path);
			});

			var node_4 = $.sibling(node_3);

			$.each(node_4, 17, () => $.get(shapes).filter((s) => s.type === 'circle'), $.index, ($$anchor, circle) => {
				var circle_1 = root_2();

				$.template_effect(() => {
					$.set_attribute(circle_1, 'cx', $.get(circle).cx);
					$.set_attribute(circle_1, 'cy', $.get(circle).cy);
					$.set_attribute(circle_1, 'r', $.get(circle).r);
					$.set_attribute(circle_1, 'fill', $.get(circle).fill);
					$.set_attribute(circle_1, 'opacity', $.get(circle).opacity);
				});

				$.append($$anchor, circle_1);
			});

			var node_5 = $.sibling(node_4);

			$.each(node_5, 17, () => $.get(shapes).filter((s) => s.type === 'rect'), $.index, ($$anchor, rect) => {
				var rect_2 = root();

				$.template_effect(() => {
					$.set_attribute(rect_2, 'x', $.get(rect).x);
					$.set_attribute(rect_2, 'y', $.get(rect).y);
					$.set_attribute(rect_2, 'width', $.get(rect).width);
					$.set_attribute(rect_2, 'height', $.get(rect).height);
					$.set_attribute(rect_2, 'rx', $.get(rect).rx);
					$.set_attribute(rect_2, 'ry', $.get(rect).ry);
					$.set_attribute(rect_2, 'fill', $.get(rect).fill);
					$.set_attribute(rect_2, 'opacity', $.get(rect).opacity);
				});

				$.append($$anchor, rect_2);
			});

			$.append($$anchor, fragment_2);
		};

		$.if(node, ($$render) => {
			if ($$props.patternContent) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(pattern);
	$.reset(defs);

	var node_6 = $.sibling(defs);

	$.snippet(node_6, () => $$props.children ?? $.noop, () => ({ id: id(), pattern: `url(#${id()})` }));
	$.append($$anchor, fragment);
	$.pop();
}
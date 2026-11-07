import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cls } from '@layerstack/tailwind';
import { createId } from '$lib/utils/createId.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'type',
	'id',
	'size',
	'markerWidth',
	'markerHeight',
	'markerUnits',
	'orient',
	'refX',
	'refY',
	'viewBox',
	'class',
	'children'
]);

var root = $.from_svg(`<path d="M 0 0 L 10 5 L 0 10 z" class="lc-marker-triangle"></path>`);
var root_1 = $.from_svg(`<polyline points="0 0, 10 5, 0 10" class="lc-marker-arrow"></polyline>`);
var root_2 = $.from_svg(`<circle class="lc-marker-circle"></circle>`);
var root_3 = $.from_svg(`<polyline points="5 0, 5 10" class="lc-marker-line"></polyline>`);
var root_4 = $.from_svg(`<rect class="lc-marker-square"></rect>`);
var root_5 = $.from_svg(`<defs><marker><!></marker></defs>`);

export default function Marker($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => createId('marker-', uid)),
		size = $.prop($$props, 'size', 3, 10),
		markerWidth = $.prop($$props, 'markerWidth', 19, size),
		markerHeight = $.prop($$props, 'markerHeight', 19, size),
		markerUnits = $.prop($$props, 'markerUnits', 3, 'userSpaceOnUse'),
		orient = $.prop($$props, 'orient', 3, 'auto-start-reverse'),
		refX = $.prop($$props, 'refX', 19, () => ['arrow', 'triangle'].includes($$props.type ?? '') ? 9 : 5),
		refY = $.prop($$props, 'refY', 3, 5),
		viewBox = $.prop($$props, 'viewBox', 3, '0 0 10 10'),
		restProps = $.rest_props($$props, rest_excludes);

	var defs = root_5();
	var marker = $.child(defs);

	$.attribute_effect(
		marker,
		($0) => ({
			id: id(),
			markerWidth: markerWidth(),
			markerHeight: markerHeight(),
			markerUnits: markerUnits(),
			orient: orient(),
			refX: refX(),
			refY: refY(),
			viewBox: viewBox(),
			'data-type': $$props.type,
			...restProps,
			class: $0
		}),
		[() => cls('lc-marker', $$props.class)],
		void 0,
		void 0,
		'svelte-yb2b8g'
	);

	var node = $.child(marker);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.snippet(node_1, () => $$props.children);
			$.append($$anchor, fragment);
		};

		var consequent_1 = ($$anchor) => {
			var path = root();

			$.append($$anchor, path);
		};

		var consequent_2 = ($$anchor) => {
			var polyline = root_1();

			$.append($$anchor, polyline);
		};

		var consequent_3 = ($$anchor) => {
			var circle = root_2();

			$.set_attribute(circle, 'cx', 5);
			$.set_attribute(circle, 'cy', 5);
			$.set_attribute(circle, 'r', 5);
			$.append($$anchor, circle);
		};

		var consequent_4 = ($$anchor) => {
			var polyline_1 = root_3();

			$.append($$anchor, polyline_1);
		};

		var consequent_5 = ($$anchor) => {
			var rect = root_4();

			$.set_attribute(rect, 'x', 0);
			$.set_attribute(rect, 'y', 0);
			$.set_attribute(rect, 'width', 10);
			$.set_attribute(rect, 'height', 10);
			$.append($$anchor, rect);
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent); else if ($$props.type === 'triangle') $$render(consequent_1, 1); else if ($$props.type === 'arrow') $$render(consequent_2, 2); else if ($$props.type === 'circle' || $$props.type === 'circle-stroke' || $$props.type === 'dot') $$render(consequent_3, 3); else if ($$props.type === 'line') $$render(consequent_4, 4); else if ($$props.type === 'square' || $$props.type === 'square-stroke') $$render(consequent_5, 5);
		});
	}

	$.reset(marker);
	$.reset(defs);
	$.append($$anchor, defs);
	$.pop();
}
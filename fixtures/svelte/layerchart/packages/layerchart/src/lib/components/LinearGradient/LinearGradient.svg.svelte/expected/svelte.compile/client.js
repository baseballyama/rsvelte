import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cls } from '@layerstack/tailwind';
import { createId } from '$lib/utils/createId.js';
import { extractLayerProps } from '$lib/utils/attributes.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'id',
	'stops',
	'vertical',
	'x1',
	'y1',
	'x2',
	'y2',
	'rotate',
	'units',
	'ref',
	'class',
	'stopsContent',
	'children'
]);

var root = $.from_svg(`<stop></stop>`);
var root_1 = $.from_svg(`<defs><linearGradient><!></linearGradient></defs><!>`, 1);

export default function LinearGradient_svg($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => createId('linearGradient-', uid)),
		stops = $.prop($$props, 'stops', 19, () => ['var(--tw-gradient-from)', 'var(--tw-gradient-to)']),
		vertical = $.prop($$props, 'vertical', 3, false),
		x1 = $.prop($$props, 'x1', 3, '0%'),
		y1 = $.prop($$props, 'y1', 3, '0%'),
		x2 = $.prop($$props, 'x2', 19, () => vertical() ? '0%' : '100%'),
		y2 = $.prop($$props, 'y2', 19, () => vertical() ? '100%' : '0%'),
		units = $.prop($$props, 'units', 3, 'objectBoundingBox'),
		refProp = $.prop($$props, 'ref', 15),
		rest = $.rest_props($$props, rest_excludes);

	let ref = $.state(void 0);

	$.user_pre_effect(() => {
		refProp($.get(ref));
	});

	var fragment = root_1();
	var defs = $.first_child(fragment);
	var linearGradient = $.child(defs);

	$.attribute_effect(
		linearGradient,
		($0) => ({
			id: id(),
			x1: x1(),
			y1: y1(),
			x2: x2(),
			y2: y2(),
			gradientTransform: $$props.rotate ? `rotate(${$$props.rotate})` : '',
			gradientUnits: units(),
			...$0
		}),
		[() => extractLayerProps(rest, 'lc-linear-gradient')]
	);

	var node = $.child(linearGradient);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.stopsContent ?? $.noop);
			$.append($$anchor, fragment_1);
		};

		var consequent_2 = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_2 = $.first_child(fragment_2);

			$.each(node_2, 17, stops, $.index, ($$anchor, stop, i) => {
				var fragment_3 = $.comment();
				var node_3 = $.first_child(fragment_3);

				{
					var consequent_1 = ($$anchor) => {
						var stop_1 = root();

						$.template_effect(
							($0) => {
								$.set_attribute(stop_1, 'offset', $.get(stop)[0]);
								$.set_attribute(stop_1, 'stop-color', $.get(stop)[1]);
								$.set_class(stop_1, 0, $0);
							},
							[() => $.clsx(cls('lc-linear-gradient-stop', $$props.class))]
						);

						$.append($$anchor, stop_1);
					};

					var d = $.derived(() => Array.isArray($.get(stop)));

					var alternate = ($$anchor) => {
						var stop_2 = root();

						$.template_effect(
							($0) => {
								$.set_attribute(stop_2, 'offset', `${i * (100 / (stops().length - 1))}%`);
								$.set_attribute(stop_2, 'stop-color', $.get(stop));
								$.set_class(stop_2, 0, $0);
							},
							[() => $.clsx(cls('lc-linear-gradient-stop', $$props.class))]
						);

						$.append($$anchor, stop_2);
					};

					$.if(node_3, ($$render) => {
						if ($.get(d)) $$render(consequent_1); else $$render(alternate, -1);
					});
				}

				$.append($$anchor, fragment_3);
			});

			$.append($$anchor, fragment_2);
		};

		$.if(node, ($$render) => {
			if ($$props.stopsContent) $$render(consequent); else if (stops()) $$render(consequent_2, 1);
		});
	}

	$.reset(linearGradient);
	$.bind_this(linearGradient, ($$value) => $.set(ref, $$value), () => $.get(ref));
	$.reset(defs);

	var node_4 = $.sibling(defs);

	$.snippet(node_4, () => $$props.children ?? $.noop, () => ({ id: id(), gradient: `url(#${id()})` }));
	$.append($$anchor, fragment);
	$.pop();
}
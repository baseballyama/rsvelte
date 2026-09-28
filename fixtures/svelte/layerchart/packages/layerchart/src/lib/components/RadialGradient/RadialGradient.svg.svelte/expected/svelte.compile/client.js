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
	'cx',
	'cy',
	'fx',
	'fy',
	'r',
	'spreadMethod',
	'transform',
	'units',
	'children',
	'stopsContent',
	'class'
]);

var root = $.from_svg(`<stop></stop>`);
var root_1 = $.from_svg(`<defs><radialGradient><!></radialGradient></defs><!>`, 1);

export default function RadialGradient_svg($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => createId('radialGradient-', uid)),
		stops = $.prop($$props, 'stops', 19, () => ['var(--tw-gradient-from)', 'var(--tw-gradient-to)']),
		cx = $.prop($$props, 'cx', 3, '50%'),
		cy = $.prop($$props, 'cy', 3, '50%'),
		fx = $.prop($$props, 'fx', 19, cx),
		fy = $.prop($$props, 'fy', 19, cy),
		r = $.prop($$props, 'r', 3, '50%'),
		spreadMethod = $.prop($$props, 'spreadMethod', 3, 'pad'),
		transform = $.prop($$props, 'transform', 3, undefined),
		units = $.prop($$props, 'units', 3, 'objectBoundingBox'),
		rest = $.rest_props($$props, rest_excludes);

	var fragment = root_1();
	var defs = $.first_child(fragment);
	var radialGradient = $.child(defs);

	$.attribute_effect(
		radialGradient,
		($0) => ({
			id: id(),
			cx: cx(),
			cy: cy(),
			fx: fx(),
			fy: fy(),
			r: r(),
			spreadMethod: spreadMethod(),
			gradientTransform: transform(),
			gradientUnits: units(),
			...$0
		}),
		[
			() => extractLayerProps({ ...rest, class: $$props.class }, 'lc-radial-gradient')
		]
	);

	var node = $.child(radialGradient);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.stopsContent);
			$.append($$anchor, fragment_1);
		};

		var consequent_2 = ($$anchor) => {
			const stopClass = $.derived(() => cls('lc-radial-gradient-stop', $$props.class));
			var fragment_2 = $.comment();
			var node_2 = $.first_child(fragment_2);

			$.each(node_2, 17, stops, $.index, ($$anchor, stop, i) => {
				var fragment_3 = $.comment();
				var node_3 = $.first_child(fragment_3);

				{
					var consequent_1 = ($$anchor) => {
						var stop_1 = root();

						$.template_effect(() => {
							$.set_attribute(stop_1, 'offset', $.get(stop)[0]);
							$.set_attribute(stop_1, 'stop-color', $.get(stop)[1]);
							$.set_class(stop_1, 0, $.clsx($.get(stopClass)));
						});

						$.append($$anchor, stop_1);
					};

					var d = $.derived(() => Array.isArray($.get(stop)));

					var alternate = ($$anchor) => {
						var stop_2 = root();

						$.template_effect(() => {
							$.set_attribute(stop_2, 'offset', `${i * (100 / (stops().length - 1))}%`);
							$.set_attribute(stop_2, 'stop-color', $.get(stop));
							$.set_class(stop_2, 0, $.clsx($.get(stopClass)));
						});

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

	$.reset(radialGradient);
	$.reset(defs);

	var node_4 = $.sibling(defs);

	$.snippet(node_4, () => $$props.children ?? $.noop, () => ({ id: id(), gradient: `url(#${id()})` }));
	$.append($$anchor, fragment);
	$.pop();
}
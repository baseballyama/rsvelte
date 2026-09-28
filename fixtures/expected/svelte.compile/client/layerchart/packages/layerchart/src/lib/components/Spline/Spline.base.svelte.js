import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SplineState } from './Spline.shared.svelte.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'Path',
	'data',
	'x',
	'y',
	'z',
	'seriesKey',
	'defined',
	'curve',
	'stroke',
	'fill',
	'opacity',
	'class',
	'motion'
]);

export default function Spline_base($$anchor, $$props) {
	$.push($$props, true);

	let // Pulled out of `restProps` so a function-valued `class` isn't spread onto the element
	restProps = $.rest_props($$props, rest_excludes);

	const c = new SplineState(() => ({
		data: $$props.data,
		x: $$props.x,
		y: $$props.y,
		z: $$props.z,
		seriesKey: $$props.seriesKey,
		defined: $$props.defined,
		curve: $$props.curve,
		stroke: $$props.stroke,
		fill: $$props.fill,
		opacity: $$props.opacity,
		class: $$props.class,
		motion: $$props.motion
	}));

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.each(node_1, 17, () => c.segments, $.index, ($$anchor, seg) => {
				var fragment_2 = $.comment();
				var node_2 = $.first_child(fragment_2);

				{
					let $0 = $.derived(() => $.get(seg).opacity ?? (c.seriesOpacity === 1 ? undefined : c.seriesOpacity));

					$.component(node_2, () => $$props.Path, ($$anchor, Path_1) => {
						Path_1($$anchor, $.spread_props(
							{
								get pathData() {
									return $.get(seg).d;
								},

								get stroke() {
									return $.get(seg).stroke;
								},

								get fill() {
									return $.get(seg).fill;
								},

								get opacity() {
									return $.get($0);
								},

								get class() {
									return $.get(seg).class;
								}
							},
							() => c.series?.props,
							() => restProps
						));
					});
				}

				$.append($$anchor, fragment_2);
			});

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var fragment_3 = $.comment();
			var node_3 = $.first_child(fragment_3);

			{
				let $0 = $.derived(() => c.isTweened ? c.tweenedPath : c.d);
				let $1 = $.derived(() => (typeof $$props.opacity === 'number' ? $$props.opacity : undefined) ?? (c.seriesOpacity === 1 ? undefined : c.seriesOpacity));

				$.component(node_3, () => $$props.Path, ($$anchor, Path_2) => {
					Path_2($$anchor, $.spread_props(
						{
							get pathData() {
								return $.get($0);
							},

							get stroke() {
								return c.resolvedStroke;
							},

							get fill() {
								return c.resolvedFill;
							},

							get opacity() {
								return $.get($1);
							},

							get class() {
								return c.resolvedClass;
							}
						},
						() => c.series?.props,
						() => restProps
					));
				});
			}

			$.append($$anchor, fragment_3);
		};

		$.if(node, ($$render) => {
			if (c.segments) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}
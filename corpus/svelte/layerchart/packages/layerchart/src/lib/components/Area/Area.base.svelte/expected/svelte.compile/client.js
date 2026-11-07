import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { extractLayerProps } from '$lib/utils/attributes.js';
import { AreaState } from './Area.shared.svelte.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'Path',
	'Spline',
	'curve',
	'data',
	'defined',
	'fill',
	'stroke',
	'opacity',
	'class',
	'line',
	'pathData',
	'motion',
	'x',
	'y0',
	'y1',
	'z',
	'seriesKey'
]);

var root = $.from_html(`<!> <!>`, 1);

export default function Area_base($$anchor, $$props) {
	$.push($$props, true);

	let stroke = $.prop($$props, 'stroke', 3, 'none'),
		// Pulled out of `restProps` so the resolved values win over the raw props
		line = $.prop($$props, 'line', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	const c = new AreaState(() => ({
		curve: $$props.curve,
		data: $$props.data,
		defined: $$props.defined,
		fill: $$props.fill,
		stroke: stroke(),
		opacity: $$props.opacity,
		class: $$props.class,
		line: line(),
		pathData: $$props.pathData,
		motion: $$props.motion,
		x: $$props.x,
		y0: $$props.y0,
		y1: $$props.y1,
		z: $$props.z,
		seriesKey: $$props.seriesKey
	}));

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.each(node_1, 17, () => c.areas, $.index, ($$anchor, area) => {
				var fragment_2 = root();
				var node_2 = $.first_child(fragment_2);

				{
					var consequent = ($$anchor) => {
						var fragment_3 = $.comment();
						var node_3 = $.first_child(fragment_3);

						{
							let $0 = $.derived(() => extractLayerProps(line(), 'lc-area-line'));

							$.component(node_3, () => $$props.Spline, ($$anchor, Spline_1) => {
								Spline_1($$anchor, $.spread_props(
									{
										get data() {
											return $.get(area).data;
										},

										get x() {
											return $$props.x;
										},

										get y() {
											return c.lineYAccessor;
										},

										get seriesKey() {
											return $$props.seriesKey;
										},

										get curve() {
											return $$props.curve;
										},

										get defined() {
											return $$props.defined;
										},

										get stroke() {
											return $.get(area).fill;
										}
									},
									() => $.get($0)
								));
							});
						}

						$.append($$anchor, fragment_3);
					};

					$.if(node_2, ($$render) => {
						if (line()) $$render(consequent);
					});
				}

				var node_4 = $.sibling(node_2, 2);

				{
					let $0 = $.derived(() => $.get(area).opacity ?? c.pathOpacity);
					let $1 = $.derived(() => extractLayerProps(restProps, 'lc-area-path', $.get(area).class ?? ''));

					$.component(node_4, () => $$props.Path, ($$anchor, Path_1) => {
						Path_1($$anchor, $.spread_props(
							{
								get pathData() {
									return $.get(area).d;
								},

								get fill() {
									return $.get(area).fill;
								},

								get stroke() {
									return $.get(area).stroke;
								},

								get opacity() {
									return $.get($0);
								}
							},
							() => $.get($1)
						));
					});
				}

				$.append($$anchor, fragment_2);
			});

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var fragment_4 = root();
			var node_5 = $.first_child(fragment_4);

			{
				var consequent_2 = ($$anchor) => {
					var fragment_5 = $.comment();
					var node_6 = $.first_child(fragment_5);

					{
						let $0 = $.derived(() => $$props.data ?? c.seriesData);
						let $1 = $.derived(() => extractLayerProps(line(), 'lc-area-line'));

						$.component(node_6, () => $$props.Spline, ($$anchor, Spline_2) => {
							Spline_2($$anchor, $.spread_props(
								{
									get data() {
										return $.get($0);
									},

									get x() {
										return $$props.x;
									},

									get y() {
										return c.lineYAccessor;
									},

									get seriesKey() {
										return $$props.seriesKey;
									},

									get curve() {
										return $$props.curve;
									},

									get defined() {
										return $$props.defined;
									},

									get motion() {
										return $$props.motion;
									}
								},
								() => $.get($1)
							));
						});
					}

					$.append($$anchor, fragment_5);
				};

				$.if(node_5, ($$render) => {
					if (line()) $$render(consequent_2);
				});
			}

			var node_7 = $.sibling(node_5, 2);

			{
				let $0 = $.derived(() => c.resolvedOpacity ?? c.pathOpacity);
				let $1 = $.derived(() => extractLayerProps(restProps, 'lc-area-path', c.resolvedClass ?? ''));

				$.component(node_7, () => $$props.Path, ($$anchor, Path_2) => {
					Path_2($$anchor, $.spread_props(
						{
							get pathData() {
								return c.tweenedPath;
							},

							get fill() {
								return c.resolvedFill;
							},

							get stroke() {
								return c.resolvedStroke;
							},

							get opacity() {
								return $.get($0);
							}
						},
						() => $.get($1)
					));
				});
			}

			$.append($$anchor, fragment_4);
		};

		$.if(node, ($$render) => {
			if (c.areas) $$render(consequent_1); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}
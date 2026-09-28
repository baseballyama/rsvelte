import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getLayerContext } from '$lib/contexts/layer.js';
import { getGeoContext } from '$lib/contexts/geo.js';
import { extractLayerProps } from '$lib/utils/attributes.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'Circle',
	'Group',
	'lat',
	'long',
	'ref',
	'children',
	'opacity',
	'fillOpacity',
	'strokeWidth',
	'class'
]);

var root = $.from_html(`<!> <!>`, 1);

export default function GeoPoint_base($$anchor, $$props) {
	$.push($$props, true);

	let refProp = $.prop($$props, 'ref', 15),
		restProps = $.rest_props($$props, rest_excludes);

	let ref = void 0;

	$.user_pre_effect(() => {
		refProp(ref);
	});

	const geo = getGeoContext();
	const points = $.derived(() => geo.projection?.([$$props.long, $$props.lat]) ?? [0, 0]);
	const x = $.derived(() => $.get(points)[0]);
	const y = $.derived(() => $.get(points)[1]);
	const layerCtx = getLayerContext();
	var fragment = root();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					{
						let $0 = $.derived(() => extractLayerProps(restProps, 'lc-geo-point-group'));

						$.component(node_2, () => $$props.Group, ($$anchor, Group_1) => {
							Group_1($$anchor, $.spread_props(
								{
									get x() {
										return $.get(x);
									},

									get y() {
										return $.get(y);
									},

									get opacity() {
										return $$props.opacity;
									},

									get class() {
										return $$props.class;
									}
								},
								() => $.get($0),
								{
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_3 = $.first_child(fragment_3);

										$.snippet(node_3, () => $$props.children, () => ({ x: $.get(x), y: $.get(y) }));
										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								}
							));
						});
					}

					$.append($$anchor, fragment_2);
				};

				var alternate = ($$anchor) => {
					var fragment_4 = $.comment();
					var node_4 = $.first_child(fragment_4);

					{
						let $0 = $.derived(() => extractLayerProps(restProps, 'lc-geo-point'));

						$.component(node_4, () => $$props.Circle, ($$anchor, Circle_1) => {
							Circle_1($$anchor, $.spread_props(
								{
									get cx() {
										return $.get(x);
									},

									get cy() {
										return $.get(y);
									},

									get opacity() {
										return $$props.opacity;
									},

									get fillOpacity() {
										return $$props.fillOpacity;
									},

									get strokeWidth() {
										return $$props.strokeWidth;
									},

									get class() {
										return $$props.class;
									}
								},
								() => $.get($0)
							));
						});
					}

					$.append($$anchor, fragment_4);
				};

				$.if(node_1, ($$render) => {
					if ($$props.children) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (layerCtx === 'svg') $$render(consequent_1);
		});
	}

	var node_5 = $.sibling(node, 2);

	{
		var consequent_3 = ($$anchor) => {
			var fragment_5 = $.comment();
			var node_6 = $.first_child(fragment_5);

			{
				var consequent_2 = ($$anchor) => {
					var fragment_6 = $.comment();
					var node_7 = $.first_child(fragment_6);

					$.snippet(node_7, () => $$props.children, () => ({ x: $.get(x), y: $.get(y) }));
					$.append($$anchor, fragment_6);
				};

				var alternate_1 = ($$anchor) => {
					var fragment_7 = $.comment();
					var node_8 = $.first_child(fragment_7);

					{
						let $0 = $.derived(() => extractLayerProps(restProps, 'lc-geo-point'));

						$.component(node_8, () => $$props.Circle, ($$anchor, Circle_2) => {
							Circle_2($$anchor, $.spread_props(
								{
									get cx() {
										return $.get(x);
									},

									get cy() {
										return $.get(y);
									},

									get opacity() {
										return $$props.opacity;
									},

									get fillOpacity() {
										return $$props.fillOpacity;
									},

									get strokeWidth() {
										return $$props.strokeWidth;
									},

									get class() {
										return $$props.class;
									}
								},
								() => $.get($0)
							));
						});
					}

					$.append($$anchor, fragment_7);
				};

				$.if(node_6, ($$render) => {
					if ($$props.children) $$render(consequent_2); else $$render(alternate_1, -1);
				});
			}

			$.append($$anchor, fragment_5);
		};

		$.if(node_5, ($$render) => {
			if (layerCtx === 'canvas') $$render(consequent_3);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}
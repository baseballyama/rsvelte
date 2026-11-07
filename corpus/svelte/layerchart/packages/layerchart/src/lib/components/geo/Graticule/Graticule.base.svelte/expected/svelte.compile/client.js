import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { geoGraticule } from 'd3-geo';
import { extractLayerProps } from '$lib/utils/attributes.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'Group',
	'GeoPath',
	'lines',
	'outline',
	'stepX',
	'stepY'
]);

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Graticule_base($$anchor, $$props) {
	$.push($$props, true);

	let stepX = $.prop($$props, 'stepX', 3, 10),
		stepY = $.prop($$props, 'stepY', 3, 10),
		restProps = $.rest_props($$props, rest_excludes);

	const graticule = $.derived(() => geoGraticule().step([stepX(), stepY()]));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => $$props.Group, ($$anchor, Group_1) => {
		Group_1($$anchor, {
			class: 'lc-graticule-g',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				{
					var consequent = ($$anchor) => {
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						{
							let $0 = $.derived(() => $.get(graticule)());
							let $1 = $.derived(() => extractLayerProps(restProps, 'lc-graticule-geo-path'));

							$.component(node_2, () => $$props.GeoPath, ($$anchor, GeoPath_1) => {
								GeoPath_1($$anchor, $.spread_props(
									{
										get geojson() {
											return $.get($0);
										}
									},
									() => $.get($1)
								));
							});
						}

						$.append($$anchor, fragment_2);
					};

					$.if(node_1, ($$render) => {
						if (!$$props.lines && !$$props.outline) $$render(consequent);
					});
				}

				var node_3 = $.sibling(node_1, 2);

				{
					var consequent_1 = ($$anchor) => {
						var fragment_3 = $.comment();
						var node_4 = $.first_child(fragment_3);

						$.each(node_4, 17, () => $.get(graticule).lines(), $.index, ($$anchor, line) => {
							var fragment_4 = $.comment();
							var node_5 = $.first_child(fragment_4);

							{
								let $0 = $.derived(() => extractLayerProps($$props.lines, 'lc-graticule-geo-line'));

								$.component(node_5, () => $$props.GeoPath, ($$anchor, GeoPath_2) => {
									GeoPath_2($$anchor, $.spread_props(
										{
											get geojson() {
												return $.get(line);
											}
										},
										() => $.get($0)
									));
								});
							}

							$.append($$anchor, fragment_4);
						});

						$.append($$anchor, fragment_3);
					};

					$.if(node_3, ($$render) => {
						if ($$props.lines) $$render(consequent_1);
					});
				}

				var node_6 = $.sibling(node_3, 2);

				{
					var consequent_2 = ($$anchor) => {
						var fragment_5 = $.comment();
						var node_7 = $.first_child(fragment_5);

						{
							let $0 = $.derived(() => $.get(graticule).outline());
							let $1 = $.derived(() => extractLayerProps($$props.outline, 'lc-graticule-geo-outline'));

							$.component(node_7, () => $$props.GeoPath, ($$anchor, GeoPath_3) => {
								GeoPath_3($$anchor, $.spread_props(
									{
										get geojson() {
											return $.get($0);
										}
									},
									() => $.get($1)
								));
							});
						}

						$.append($$anchor, fragment_5);
					};

					$.if(node_6, ($$render) => {
						if ($$props.outline) $$render(consequent_2);
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}
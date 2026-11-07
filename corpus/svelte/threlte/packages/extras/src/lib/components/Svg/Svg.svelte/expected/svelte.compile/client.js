import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useLoader } from '@threlte/core';
import { DoubleSide } from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { useSuspense } from '../../suspense/useSuspense.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'src',
	'skipFill',
	'skipStrokes',
	'fillMaterialProps',
	'strokeMaterialProps',
	'fillMeshProps',
	'strokeMeshProps',
	'ref'
]);

var root = $.from_html(`<!> <!>`, 1);

export default function Svg($$anchor, $$props) {
	$.push($$props, true);

	const $svg = () => $.store_get($.get(svg), '$svg', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	/** Can be a URL or SVG data */
	let skipFill = $.prop($$props, 'skipFill', 3, false),
		skipStrokes = $.prop($$props, 'skipStrokes', 3, false),
		ref = $.prop($$props, 'ref', 15),
		rest = $.rest_props($$props, rest_excludes);

	const suspend = useSuspense();
	const loader = useLoader(SVGLoader);

	const svg = $.derived(() => suspend(loader.load($$props.src.startsWith('<svg')
		? `data:image/svg+xml;utf8,${$$props.src}`
		: $$props.src)));

	const paths = $.derived(() => $svg()?.paths ?? []);

	const strokeGeometries = $.derived(() => skipStrokes()
		? []
		: $.get(paths).map((path) => path.userData?.style.stroke === undefined || path.userData.style.stroke === 'none'
			? null
			: path.subPaths.map((subPath) => SVGLoader.pointsToStroke(subPath.getPoints(), path.userData?.style))));

	$.user_pre_effect(() => {
		return () => {
			for (const group of $.get(strokeGeometries)) {
				if (group) {
					group.map((g) => g.dispose());
				}
			}
		};
	});

	// svelte-ignore non_reactive_update
	let renderOrder = 0;

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => T.Group, ($$anchor, T_Group) => {
		T_Group($$anchor, $.spread_props(() => rest, {
			get ref() {
				return ref();
			},

			set ref($$value) {
				ref($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => T.Group, ($$anchor, T_Group_1) => {
					T_Group_1($$anchor, {
						'scale.y': -1,
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_2 = $.first_child(fragment_2);

							$.each(node_2, 18, () => $.get(paths), (path) => path, ($$anchor, path, p) => {
								var fragment_3 = root();
								var node_3 = $.first_child(fragment_3);

								{
									var consequent = ($$anchor) => {
										var fragment_4 = $.comment();
										var node_4 = $.first_child(fragment_4);

										$.each(node_4, 16, () => SVGLoader.createShapes(path), (shape) => shape, ($$anchor, shape) => {
											var fragment_5 = $.comment();
											var node_5 = $.first_child(fragment_5);

											{
												let $0 = $.derived(() => renderOrder++);

												$.component(node_5, () => T.Mesh, ($$anchor, T_Mesh) => {
													T_Mesh($$anchor, $.spread_props(() => $$props.fillMeshProps, {
														get renderOrder() {
															return $.get($0);
														},

														children: ($$anchor, $$slotProps) => {
															var fragment_6 = root();
															var node_6 = $.first_child(fragment_6);

															{
																let $0 = $.derived(() => [shape]);

																$.component(node_6, () => T.ShapeGeometry, ($$anchor, T_ShapeGeometry) => {
																	T_ShapeGeometry($$anchor, {
																		get args() {
																			return $.get($0);
																		}
																	});
																});
															}

															var node_7 = $.sibling(node_6, 2);

															{
																let $0 = $.derived(() => path.userData?.style.fill);
																let $1 = $.derived(() => path.userData?.style.fillOpacity);

																$.component(node_7, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial) => {
																	T_MeshBasicMaterial($$anchor, $.spread_props(
																		{
																			get color() {
																				return $.get($0);
																			},

																			get opacity() {
																				return $.get($1);
																			},
																			transparent: true,
																			get side() {
																				return DoubleSide;
																			},
																			depthWrite: false
																		},
																		() => $$props.fillMaterialProps
																	));
																});
															}

															$.append($$anchor, fragment_6);
														},
														$$slots: { default: true }
													}));
												});
											}

											$.append($$anchor, fragment_5);
										});

										$.append($$anchor, fragment_4);
									};

									$.if(node_3, ($$render) => {
										if (!skipFill() && path.userData?.style.fill !== undefined && path.userData.style.fill !== 'none') $$render(consequent);
									});
								}

								var node_8 = $.sibling(node_3, 2);

								{
									var consequent_2 = ($$anchor) => {
										var fragment_7 = $.comment();
										var node_9 = $.first_child(fragment_7);

										$.each(node_9, 18, () => path.subPaths, (_subPath) => _subPath, ($$anchor, _subPath, s) => {
											var fragment_8 = $.comment();
											var node_10 = $.first_child(fragment_8);

											{
												var consequent_1 = ($$anchor) => {
													var fragment_9 = $.comment();
													var node_11 = $.first_child(fragment_9);

													{
														let $0 = $.derived(() => $.get(strokeGeometries)[$.get(p)]?.[$.get(s)]);
														let $1 = $.derived(() => renderOrder++);

														$.component(node_11, () => T.Mesh, ($$anchor, T_Mesh_1) => {
															T_Mesh_1($$anchor, $.spread_props(
																{
																	get geometry() {
																		return $.get($0);
																	}
																},
																() => $$props.strokeMeshProps,
																{
																	get renderOrder() {
																		return $.get($1);
																	},

																	children: ($$anchor, $$slotProps) => {
																		var fragment_10 = $.comment();
																		var node_12 = $.first_child(fragment_10);

																		{
																			let $0 = $.derived(() => path.userData?.style.stroke);
																			let $1 = $.derived(() => path.userData?.style.strokeOpacity);

																			$.component(node_12, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial_1) => {
																				T_MeshBasicMaterial_1($$anchor, $.spread_props(
																					{
																						get color() {
																							return $.get($0);
																						},

																						get opacity() {
																							return $.get($1);
																						},
																						transparent: true,
																						get side() {
																							return DoubleSide;
																						},
																						depthWrite: false
																					},
																					() => $$props.strokeMaterialProps
																				));
																			});
																		}

																		$.append($$anchor, fragment_10);
																	},
																	$$slots: { default: true }
																}
															));
														});
													}

													$.append($$anchor, fragment_9);
												};

												$.if(node_10, ($$render) => {
													if ($.get(strokeGeometries)[$.get(p)]) $$render(consequent_1);
												});
											}

											$.append($$anchor, fragment_8);
										});

										$.append($$anchor, fragment_7);
									};

									$.if(node_8, ($$render) => {
										if (!skipStrokes() && path.userData?.style.stroke !== undefined && path.userData.style.stroke !== 'none') $$render(consequent_2);
									});
								}

								$.append($$anchor, fragment_3);
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}));
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}
import * as $ from 'svelte/internal/server';
import { T, useLoader } from '@threlte/core';
import { DoubleSide } from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { useSuspense } from '../../suspense/useSuspense.js';

export default function Svg($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		/** Can be a URL or SVG data */
		let {
			src,
			skipFill = false,
			skipStrokes = false,
			fillMaterialProps,
			strokeMaterialProps,
			fillMeshProps,
			strokeMeshProps,
			ref = void 0,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const suspend = useSuspense();
		const loader = useLoader(SVGLoader);
		const svg = $.derived(() => suspend(loader.load(src.startsWith('<svg') ? `data:image/svg+xml;utf8,${src}` : src)));
		const paths = $.derived(() => $.store_get($$store_subs ??= {}, '$svg', svg())?.paths ?? []);

		const strokeGeometries = $.derived(() => skipStrokes
			? []
			: paths().map((path) => path.userData?.style.stroke === undefined || path.userData.style.stroke === 'none'
				? null
				: path.subPaths.map((subPath) => SVGLoader.pointsToStroke(subPath.getPoints(), path.userData?.style))));

		// svelte-ignore non_reactive_update
		let renderOrder = 0;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (T.Group) {
				$$renderer.push('<!--[-->');

				T.Group($$renderer, $.spread_props([
					rest,
					{
						get ref() {
							return ref;
						},

						set ref($$value) {
							ref = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							if (T.Group) {
								$$renderer.push('<!--[-->');

								T.Group($$renderer, {
									'scale.y': -1,
									children: ($$renderer) => {
										$$renderer.push(`<!--[-->`);

										const each_array = $.ensure_array_like(paths());

										for (let p = 0, $$length = each_array.length; p < $$length; p++) {
											let path = each_array[p];

											if (!skipFill && path.userData?.style.fill !== undefined && path.userData.style.fill !== 'none') {
												$$renderer.push(`<!--[0--><!--[-->`);

												const each_array_1 = $.ensure_array_like(SVGLoader.createShapes(path));

												for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
													let shape = each_array_1[$$index];

													if (T.Mesh) {
														$$renderer.push('<!--[-->');

														T.Mesh($$renderer, $.spread_props([
															fillMeshProps,
															{
																renderOrder: renderOrder++,
																children: ($$renderer) => {
																	if (T.ShapeGeometry) {
																		$$renderer.push('<!--[-->');
																		T.ShapeGeometry($$renderer, { args: [shape] });
																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	if (T.MeshBasicMaterial) {
																		$$renderer.push('<!--[-->');

																		T.MeshBasicMaterial($$renderer, $.spread_props([
																			{
																				color: path.userData?.style.fill,
																				opacity: path.userData?.style.fillOpacity,
																				transparent: true,
																				side: DoubleSide,
																				depthWrite: false
																			},
																			fillMaterialProps
																		]));

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}
																},
																$$slots: { default: true }
															}
														]));

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												}

												$$renderer.push(`<!--]-->`);
											} else {
												$$renderer.push('<!--[-1-->');
											}

											$$renderer.push(`<!--]--> `);

											if (!skipStrokes && path.userData?.style.stroke !== undefined && path.userData.style.stroke !== 'none') {
												$$renderer.push(`<!--[0--><!--[-->`);

												const each_array_2 = $.ensure_array_like(path.subPaths);

												for (let s = 0, $$length = each_array_2.length; s < $$length; s++) {
													let _subPath = each_array_2[s];

													if (strokeGeometries()[p]) {
														$$renderer.push('<!--[0-->');

														if (T.Mesh) {
															$$renderer.push('<!--[-->');

															T.Mesh($$renderer, $.spread_props([
																{ geometry: strokeGeometries()[p]?.[s] },
																strokeMeshProps,
																{
																	renderOrder: renderOrder++,
																	children: ($$renderer) => {
																		if (T.MeshBasicMaterial) {
																			$$renderer.push('<!--[-->');

																			T.MeshBasicMaterial($$renderer, $.spread_props([
																				{
																					color: path.userData?.style.stroke,
																					opacity: path.userData?.style.strokeOpacity,
																					transparent: true,
																					side: DoubleSide,
																					depthWrite: false
																				},
																				strokeMaterialProps
																			]));

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}
																	},
																	$$slots: { default: true }
																}
															]));

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}
													} else {
														$$renderer.push('<!--[-1-->');
													}

													$$renderer.push(`<!--]-->`);
												}

												$$renderer.push(`<!--]-->`);
											} else {
												$$renderer.push('<!--[-1-->');
											}

											$$renderer.push(`<!--]-->`);
										}

										$$renderer.push(`<!--]-->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						},
						$$slots: { default: true }
					}
				]));

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { ref });
	});
}
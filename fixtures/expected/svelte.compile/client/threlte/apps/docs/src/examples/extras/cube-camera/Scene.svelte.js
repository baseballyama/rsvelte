import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CubeCamera, Environment, Grid, OrbitControls } from '@threlte/extras';
import { EquirectangularReflectionMapping } from 'three';
import { RGBELoader } from 'three/examples/jsm/Addons.js';
import { T, useLoader, useTask } from '@threlte/core';

export const hdrs = {
	industrial: 'industrial_sunset_puresky_1k.hdr',
	workshop: 'aerodynamics_workshop_1k.hdr',
	puresky: 'mpumalanga_veld_puresky_1k.hdr'
};

const isHdrKey = (u) => {
	return u in hdrs;
};

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	let frames = $.prop($$props, 'frames', 3, Infinity),
		hdr = $.prop($$props, 'hdr', 3, 'auto'),
		metalness = $.prop($$props, 'metalness', 3, 1),
		near = $.prop($$props, 'near', 3, 0.1),
		far = $.prop($$props, 'far', 3, 1000),
		resolution = $.prop($$props, 'resolution', 3, 256),
		roughness = $.prop($$props, 'roughness', 3, 0);

	const colors = ['#ff00ff', '#ffff00', '#00ffff'];
	const increment = 2 * Math.PI / colors.length;
	const radius = 3;
	let time = 0;
	const groups = $.proxy([]);

	useTask((delta) => {
		time += delta;

		let i = 0;

		for (const group of groups) {
			group.position.setY(2 * Math.sin(time + i));
			i += 1;
		}
	});

	const hdrPath = '/textures/equirectangular/hdr/';

	const loader = useLoader(RGBELoader, {
		extend(loader) {
			loader.setPath(hdrPath);
		}
	});

	const backgrounds = loader.load(hdrs, {
		transform(texture) {
			texture.mapping = EquirectangularReflectionMapping;

			return texture;
		}
	});

	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, { makeDefault: true, position: [8, 5, 8] });
	});

	var node_1 = $.sibling(node, 2);

	OrbitControls(node_1, { enableDamping: true, enablePan: false, enableZoom: false });

	var node_2 = $.sibling(node_1, 2);

	Environment(node_2, { url: `${hdrPath}shanghai_riverside_1k.hdr` });

	var node_3 = $.sibling(node_2, 2);

	Grid(node_3, { 'position.y': -3, sectionColor: '#fff', cellColor: '#fff' });

	var node_4 = $.sibling(node_3, 2);

	$.await(node_4, () => backgrounds, null, ($$anchor, backgroundMap) => {
		const background = $.derived(() => isHdrKey(hdr()) ? $.get(backgroundMap)[hdr()] : hdr());
		var fragment_1 = $.comment();
		var node_5 = $.first_child(fragment_1);

		$.each(node_5, 17, () => colors, $.index, ($$anchor, color, index) => {
			const x = $.derived(() => increment * index);
			const y = $.derived(() => Math.PI + $.get(x));
			var fragment_2 = root();
			var node_6 = $.first_child(fragment_2);

			{
				let $0 = $.derived(() => radius * Math.cos($.get(x)));
				let $1 = $.derived(() => radius * Math.sin($.get(x)));

				$.component(node_6, () => T.Mesh, ($$anchor, T_Mesh) => {
					T_Mesh($$anchor, {
						get 'position.x'() {
							return $.get($0);
						},
						'position.y': index,
						get 'position.z'() {
							return $.get($1);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_7 = $.first_child(fragment_3);

							$.component(node_7, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
								T_MeshStandardMaterial($$anchor, {
									get color() {
										return $.get(color);
									}
								});
							});

							var node_8 = $.sibling(node_7, 2);

							$.component(node_8, () => T.SphereGeometry, ($$anchor, T_SphereGeometry) => {
								T_SphereGeometry($$anchor, {});
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});
			}

			var node_9 = $.sibling(node_6, 2);

			{
				let $0 = $.derived(() => radius * Math.cos($.get(y)));
				let $1 = $.derived(() => radius * Math.sin($.get(y)));

				$.component(node_9, () => T.Group, ($$anchor, T_Group) => {
					T_Group($$anchor, {
						get 'position.x'() {
							return $.get($0);
						},

						get 'position.z'() {
							return $.get($1);
						},

						get ref() {
							return groups[index];
						},

						set ref($$value) {
							groups[index] = $$value;
						},

						children: ($$anchor, $$slotProps) => {
							{
								const children = ($$anchor, $$arg0) => {
									let renderTarget = () => ($$arg0?.()).renderTarget;
									var fragment_5 = $.comment();
									var node_10 = $.first_child(fragment_5);

									$.component(node_10, () => T.Mesh, ($$anchor, T_Mesh_1) => {
										T_Mesh_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_6 = root();
												var node_11 = $.first_child(fragment_6);

												$.component(node_11, () => T.SphereGeometry, ($$anchor, T_SphereGeometry_1) => {
													T_SphereGeometry_1($$anchor, {});
												});

												var node_12 = $.sibling(node_11, 2);

												$.component(node_12, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_1) => {
													T_MeshStandardMaterial_1($$anchor, {
														get roughness() {
															return roughness();
														},

														get metalness() {
															return metalness();
														},

														get envMap() {
															return renderTarget().texture;
														}
													});
												});

												$.append($$anchor, fragment_6);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_5);
								};

								CubeCamera($$anchor, {
									get background() {
										return $.get(background);
									},

									get frames() {
										return frames();
									},

									get near() {
										return near();
									},

									get far() {
										return far();
									},

									get resolution() {
										return resolution();
									},
									children,
									$$slots: { default: true }
								});
							}
						},
						$$slots: { default: true }
					});
				});
			}

			$.append($$anchor, fragment_2);
		});

		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
	$.pop();
}
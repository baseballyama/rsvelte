import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Blob from './Blob.svelte';
import { Environment, Float, Grid, interactivity, useGltf, useDraco } from '@threlte/extras';
import { T } from '@threlte/core';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);
	interactivity();

	const dracoLoader = useDraco();
	const gltf = useGltf('/models/blobs/blobs.glb', { dracoLoader });
	const red = '#fe3d00';
	const blue = '#0000ff';
	var fragment = root_1();
	var node_1 = $.first_child(fragment);

	Environment(node_1, {
		url: '/textures/equirectangular/hdr/shanghai_riverside_1k.hdr'
	});

	var node_2 = $.sibling(node_1, 2);

	Float(node_2, {
		rotationIntensity: 0.15,
		rotationSpeed: 2,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node_3 = $.first_child(fragment_1);

			$.component(node_3, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
				T_PerspectiveCamera($$anchor, {
					makeDefault: true,
					'position.y': 10,
					'position.z': 10,
					fov: 90,
					oncreate: (ref) => {
						ref.lookAt(0, 0, 0);
					}
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_2, 2);

	Grid(node_4, {
		'position.y': -10,
		sectionThickness: 1,
		infiniteGrid: true,
		cellColor: '#dddddd',
		sectionColor: '#ffffff',
		sectionSize: 10,
		cellSize: 2
	});

	var node_5 = $.sibling(node_4, 2);

	$.await(node_5, () => gltf, null, ($$anchor, $$source) => {
		var $$value = $.derived(() => {
			var { nodes } = $.get($$source);

			return { nodes };
		});

		var nodes = $.derived(() => $.get($$value).nodes);
		var fragment_2 = $.comment();
		var node_6 = $.first_child(fragment_2);

		$.each(node_6, 17, () => Object.values($.get(nodes)), $.index, ($$anchor, node) => {
			{
				const children = ($$anchor, $$arg0) => {
					let hovering = () => ($$arg0?.()).hovering;
					var fragment_4 = $.comment();
					var node_7 = $.first_child(fragment_4);

					$.component(node_7, () => T.Mesh, ($$anchor, T_Mesh) => {
						T_Mesh($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_5 = root();
								var node_8 = $.first_child(fragment_5);

								{
									let $0 = $.derived(() => hovering() ? red : blue);

									$.component(node_8, () => T.MeshPhysicalMaterial, ($$anchor, T_MeshPhysicalMaterial) => {
										T_MeshPhysicalMaterial($$anchor, {
											reflectivity: 1,
											metalness: 0.9,
											roughness: 0.2,
											get color() {
												return $.get($0);
											}
										});
									});
								}

								var node_9 = $.sibling(node_8, 2);

								{
									var consequent = ($$anchor) => {
										T($$anchor, {
											get is() {
												return $.get(node).geometry;
											}
										});
									};

									$.if(node_9, ($$render) => {
										if ($.get(node).geometry) $$render(consequent);
									});
								}

								$.append($$anchor, fragment_5);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_4);
				};

				Blob($$anchor, { children, $$slots: { default: true } });
			}
		});

		$.append($$anchor, fragment_2);
	});

	$.append($$anchor, fragment);
	$.pop();
}
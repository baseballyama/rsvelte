import 'svelte/internal/disclose-version';
import { Euler, Matrix4, Mesh, Object3D, Texture, Vector3 } from 'three';
import * as $ from 'svelte/internal/client';
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry.js';
import { asyncWritable, T, useParent } from '@threlte/core';
import { useSuspense } from '../../suspense/useSuspense.js';
import { useTexture } from '../../hooks/useTexture.js';

const vertex = new Vector3();
const matrixWorld = new Matrix4();
const closestNormal = new Vector3();
const vec3 = new Vector3();
const object3d = new Object3D();

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'src',
	'mesh',
	'position',
	'rotation',
	'scale',
	'polygonOffsetFactor',
	'depthTest',
	'debug',
	'ref',
	'children'
]);

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Decal($$anchor, $$props) {
	$.push($$props, true);

	const $parent = () => $.store_get(parent, '$parent', $$stores);
	const $map = () => $.store_get($.get(map), '$map', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	/** Euler for manual orientation or a single float for closest-vertex-normal orient */
	let polygonOffsetFactor = $.prop($$props, 'polygonOffsetFactor', 19, () => -10),
		depthTest = $.prop($$props, 'depthTest', 3, true),
		debug = $.prop($$props, 'debug', 3, false),
		ref = $.prop($$props, 'ref', 15),
		rest = $.rest_props($$props, rest_excludes);

	const parent = useParent();
	const parentNode = $.derived(() => $$props.mesh ?? $parent());
	const mesh = new Mesh();
	const projectorPosition = new Vector3();
	const projectorRotation = new Euler();
	const projectorSize = new Vector3(1, 1, 1);
	let helper = new Mesh();
	const suspend = useSuspense();

	const map = $.derived(() => typeof $$props.src === 'string'
		? suspend(useTexture($$props.src))
		: $$props.src
			? asyncWritable(Promise.resolve($$props.src))
			: undefined);

	$.user_pre_effect(() => {
		if (!('geometry' in $.get(parentNode))) {
			throw new Error('Decal must have a Mesh as parent or specify its "mesh" prop');
		}

		if (!$map() && !$$props.children) return;

		if ($$props.position !== undefined) {
			projectorPosition.fromArray($$props.position);
		}

		if ($$props.scale !== undefined) {
			if (typeof $$props.scale === 'number') {
				projectorSize.setScalar($$props.scale);
			} else {
				projectorSize.fromArray($$props.scale);
			}
		}

		// Zero out the parents matrix world for this operation
		matrixWorld.copy($.get(parentNode).matrixWorld);

		$.get(parentNode).matrixWorld.identity();

		if ($$props.rotation === undefined || typeof $$props.rotation === 'number') {
			object3d.matrixWorld.identity();
			object3d.position.copy(projectorPosition);

			// Thanks https://x.com/N8Programs !
			const vertices = $.get(parentNode).geometry.attributes.position.array;

			if ($.get(parentNode).geometry.attributes.normal === undefined) {
				$.get(parentNode).geometry.computeVertexNormals();
			}

			const normal = $.get(parentNode).geometry.attributes.normal.array;
			let distance = Infinity;
			let chosenIdx = -1;

			for (let i = 0, l = vertices.length; i < l; i += 3) {
				const distSquared = vertex.fromArray(vertices, i).distanceToSquared(object3d.position);

				if (distSquared < distance) {
					distance = distSquared;
					chosenIdx = i;
				}
			}

			closestNormal.fromArray(normal, chosenIdx);

			// Get vector tangent to normal
			object3d.lookAt(vec3.copy(object3d.position).add(closestNormal));

			object3d.rotateZ(Math.PI);
			object3d.rotateY(Math.PI);

			if (typeof $$props.rotation === 'number') {
				object3d.rotateZ($$props.rotation);
			}

			projectorRotation.copy(object3d.rotation);
		} else {
			projectorRotation.fromArray($$props.rotation);
		}

		mesh.geometry = new DecalGeometry($.get(parentNode), projectorPosition, projectorRotation, projectorSize);

		// Reset parent's matixWorld
		$.get(parentNode).matrixWorld.copy(matrixWorld);

		if (debug()) {
			helper.position.copy(projectorPosition);
			helper.rotation.copy(projectorRotation);
			helper.scale.copy(projectorSize);
		}

		return () => mesh.geometry.dispose();
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			T($$anchor, $.spread_props(
				{
					get is() {
						return mesh;
					},
					'material.transparent': true,
					'material.polygonOffset': true,
					get 'material.polygonOffsetFactor'() {
						return polygonOffsetFactor();
					},

					get 'material.depthTest'() {
						return depthTest();
					},

					get 'material.map'() {
						return $map();
					}
				},
				() => rest,
				{
					get ref() {
						return ref();
					},

					set ref($$value) {
						ref($$value);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_1();
						var node_1 = $.first_child(fragment_2);

						$.snippet(node_1, () => $$props.children ?? $.noop, () => ({ ref: mesh }));

						var node_2 = $.sibling(node_1, 2);

						{
							var consequent = ($$anchor) => {
								T($$anchor, {
									get is() {
										return helper;
									},
									raycast: () => null,
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root();
										var node_3 = $.first_child(fragment_4);

										$.component(node_3, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
											T_BoxGeometry($$anchor, {});
										});

										var node_4 = $.sibling(node_3, 2);

										$.component(node_4, () => T.MeshNormalMaterial, ($$anchor, T_MeshNormalMaterial) => {
											T_MeshNormalMaterial($$anchor, { wireframe: true });
										});

										var node_5 = $.sibling(node_4, 2);

										$.component(node_5, () => T.AxesHelper, ($$anchor, T_AxesHelper) => {
											T_AxesHelper($$anchor, { raycast: () => null });
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							};

							$.if(node_2, ($$render) => {
								if (debug()) $$render(consequent);
							});
						}

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				}
			));
		};

		$.if(node, ($$render) => {
			if ($map() || $$props.children) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}
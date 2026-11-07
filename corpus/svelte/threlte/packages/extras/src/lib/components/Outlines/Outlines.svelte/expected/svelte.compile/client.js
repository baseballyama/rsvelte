import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { isInstanceOf, T, useParent, useThrelte } from '@threlte/core';

import {
	BackSide,
	Color,
	Group,
	InstancedMesh,
	Mesh,
	ShaderMaterial,
	SkinnedMesh,
	Uniform,
	Vector2
} from 'three';

import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { fragmentShader, vertexShader } from './shaders.js';
import { fromStore } from 'svelte/store';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'color',
	'screenspace',
	'opacity',
	'transparent',
	'thickness',
	'toneMapped',
	'angle',
	'polygonOffset',
	'polygonOffsetFactor',
	'renderOrder',
	'children',
	'ref'
]);

var root = $.from_html(`<!> <!>`, 1);

export default function Outlines($$anchor, $$props) {
	$.push($$props, true);

	let color = $.prop($$props, 'color', 3, 'black'),
		screenspace = $.prop($$props, 'screenspace', 3, false),
		opacity = $.prop($$props, 'opacity', 3, 1),
		transparent = $.prop($$props, 'transparent', 3, false),
		thickness = $.prop($$props, 'thickness', 3, 0.05),
		toneMapped = $.prop($$props, 'toneMapped', 3, true),
		angle = $.prop($$props, 'angle', 19, () => Math.PI),
		polygonOffset = $.prop($$props, 'polygonOffset', 3, false),
		polygonOffsetFactor = $.prop($$props, 'polygonOffsetFactor', 3, 0),
		renderOrder = $.prop($$props, 'renderOrder', 3, 0),
		ref = $.prop($$props, 'ref', 15),
		props = $.rest_props($$props, rest_excludes);

	const { renderer } = useThrelte();

	const uniforms = {
		screenspace: new Uniform(false),
		color: new Uniform(new Color('black')),
		opacity: new Uniform(1),
		thickness: new Uniform(0.05),
		size: new Uniform(new Vector2())
	};

	const group = new Group();
	const material = new ShaderMaterial({ side: BackSide, uniforms, vertexShader, fragmentShader });
	let parent = fromStore(useParent());

	let geometry = $.derived(() => {
		if (!isInstanceOf(parent.current, 'Mesh')) return undefined;

		return toCreasedNormals(parent.current.geometry, angle());
	});

	let mesh = $.derived(() => {
		if (!isInstanceOf(parent.current, 'Mesh')) return;

		if (isInstanceOf(parent.current, 'SkinnedMesh')) {
			const nextMesh = new SkinnedMesh();

			nextMesh.bind(parent.current.skeleton, parent.current.bindMatrix);

			return nextMesh;
		} else if (isInstanceOf(parent.current, 'InstancedMesh')) {
			const nextMesh = new InstancedMesh(undefined, undefined, parent.current.count);

			nextMesh.instanceMatrix = parent.current.instanceMatrix;

			return nextMesh;
		}

		return new Mesh();
	});

	$.user_pre_effect(() => {
		if ($.get(mesh)) $.get(mesh).renderOrder = renderOrder();
	});

	$.user_pre_effect(() => {
		material.transparent = transparent();
	});

	$.user_pre_effect(() => {
		material.toneMapped = toneMapped();
	});

	$.user_pre_effect(() => {
		material.polygonOffset = polygonOffset();
	});

	$.user_pre_effect(() => {
		material.polygonOffsetFactor = polygonOffsetFactor();
	});

	$.user_pre_effect(() => {
		material.uniforms.screenspace.value = screenspace();
	});

	$.user_pre_effect(() => {
		material.uniforms.color.value.set(color());
	});

	$.user_pre_effect(() => {
		material.uniforms.opacity.value = opacity();
	});

	$.user_pre_effect(() => {
		material.uniforms.thickness.value = thickness();
	});

	$.user_pre_effect(() => {
		renderer.getDrawingBufferSize(material.uniforms.size.value);
	});

	T($$anchor, $.spread_props(
		{
			get is() {
				return group;
			}
		},
		() => props,
		{
			get ref() {
				return ref();
			},

			set ref($$value) {
				ref($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node = $.first_child(fragment_1);

				T(node, {
					get is() {
						return $.get(mesh);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						T(node_1, {
							get is() {
								return $.get(geometry);
							}
						});

						var node_2 = $.sibling(node_1, 2);

						T(node_2, {
							get is() {
								return material;
							}
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});

				var node_3 = $.sibling(node, 2);

				$.snippet(node_3, () => $$props.children ?? $.noop, () => ({ ref: group }));
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}
	));

	$.pop();
}
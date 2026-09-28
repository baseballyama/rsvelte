import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { isInstanceOf, T, useParent, useTask, useThrelte } from '@threlte/core';
import { onMount } from 'svelte';
import { Color, Matrix4, Mesh, ShaderMaterial, Texture, Vector2 } from 'three';
import { MeshBVH, MeshBVHUniformStruct, SAH } from 'three-mesh-bvh';
import { fragmentShader } from './fragment.js';
import { vertexShader } from './vertex.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'envMap',
	'bounces',
	'ior',
	'fresnel',
	'aberrationStrength',
	'color',
	'fastChroma',
	'ref'
]);

export default function MeshRefractionMaterial($$anchor, $$props) {
	$.push($$props, true);

	const $parent = () => $.store_get(parent, '$parent', $$stores);
	const $size = () => $.store_get(size, '$size', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let bounces = $.prop($$props, 'bounces', 3, 2),
		ior = $.prop($$props, 'ior', 3, 2.4),
		fresnel = $.prop($$props, 'fresnel', 3, 0),
		aberrationStrength = $.prop($$props, 'aberrationStrength', 3, 0),
		color = $.prop($$props, 'color', 3, 'white'),
		fastChroma = $.prop($$props, 'fastChroma', 3, true),
		ref = $.prop($$props, 'ref', 15),
		props = $.rest_props($$props, rest_excludes);

	const uniforms = {
		envMap: { value: null },
		bounces: { value: 2 },
		ior: { value: 2.4 },
		correctMips: { value: true },
		aberrationStrength: { value: 0.01 },
		fresnel: { value: 0 },
		bvh: { value: new MeshBVHUniformStruct() },
		color: { value: new Color('white') },
		resolution: { value: new Vector2() },
		viewMatrixInverse: { value: new Matrix4() },
		projectionMatrixInverse: { value: new Matrix4() }
	};

	const material = new ShaderMaterial({ fragmentShader, vertexShader, uniforms });

	ref(material);

	const { size, invalidate, camera } = useThrelte();
	const parent = useParent();
	let defines = {};

	const updateDefines = (envMap, aberrationStrength, fastChroma) => {
		// Sampler2D and SamplerCube need different defines
		const isCubeMap = isInstanceOf(envMap, 'CubeTexture');

		const w = (isCubeMap ? envMap.image[0]?.width : envMap?.image.width) ?? 1024;
		const cubeSize = w / 4;
		const lodMax = Math.floor(Math.log2(cubeSize));
		const _cubeSize = Math.pow(2, lodMax);
		const width = 3 * Math.max(_cubeSize, 16 * 7);
		const height = 4 * _cubeSize;

		if (isCubeMap) defines.ENVMAP_TYPE_CUBEM = '';

		defines.CUBEUV_TEXEL_WIDTH = `${1.0 / width}`;
		defines.CUBEUV_TEXEL_HEIGHT = `${1.0 / height}`;
		defines.CUBEUV_MAX_MIP = `${lodMax}.0`;

		// Add defines from chromatic aberration
		if (aberrationStrength > 0) defines.CHROMATIC_ABERRATIONS = '';

		if (fastChroma) defines.FAST_CHROMA = '';
	};

	$.user_pre_effect(() => {
		updateDefines($$props.envMap, aberrationStrength(), fastChroma());
	});

	onMount(() => {
		// Update the BVH
		if ($parent() && $parent() instanceof Mesh && $parent().geometry) {
			uniforms.bvh.value = new MeshBVHUniformStruct();
			uniforms.bvh.value.updateFrom(new MeshBVH($parent()?.geometry.clone().toNonIndexed(), { strategy: SAH }));
		}
	});

	useTask(
		() => {
			uniforms.viewMatrixInverse.value = camera.current.matrixWorld;
			uniforms.projectionMatrixInverse.value = camera.current.projectionMatrixInverse;
		},
		{ autoInvalidate: false }
	);

	const colorObj = new Color(color());

	$.user_pre_effect(() => {
		colorObj.set(color());
		invalidate();
	});

	{
		let $0 = $.derived(() => [$size().width, $size().height]);

		T($$anchor, $.spread_props(
			{
				get is() {
					return material;
				},

				get 'uniforms.envMap.value'() {
					return $$props.envMap;
				},

				get 'uniforms.bounces.value'() {
					return bounces();
				},

				get 'uniforms.ior.value'() {
					return ior();
				},

				get 'uniforms.fresnel.value'() {
					return fresnel();
				},

				get 'uniforms.aberrationStrength.value'() {
					return aberrationStrength();
				},

				get 'uniforms.color.value'() {
					return colorObj;
				},

				get 'uniforms.resolution.value'() {
					return $.get($0);
				},

				get defines() {
					return defines;
				}
			},
			() => props
		));
	}

	$.pop();
	$$cleanup();
}
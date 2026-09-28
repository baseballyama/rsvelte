import * as $ from 'svelte/internal/server';
import { isInstanceOf, T, useParent, useTask, useThrelte } from '@threlte/core';
import { onMount } from 'svelte';
import { Color, Matrix4, Mesh, ShaderMaterial, Texture, Vector2 } from 'three';
import { MeshBVH, MeshBVHUniformStruct, SAH } from 'three-mesh-bvh';
import { fragmentShader } from './fragment.js';
import { vertexShader } from './vertex.js';

export default function MeshRefractionMaterial($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			envMap,
			bounces = 2,
			ior = 2.4,
			fresnel = 0,
			aberrationStrength = 0,
			color = 'white',
			fastChroma = true,
			ref = void 0,
			$$slots,
			$$events,
			...props
		} = $$props;

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

		ref = material;

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

		onMount(() => {
			// Update the BVH
			if ($.store_get($$store_subs ??= {}, '$parent', parent) && $.store_get($$store_subs ??= {}, '$parent', parent) instanceof Mesh && $.store_get($$store_subs ??= {}, '$parent', parent).geometry) {
				uniforms.bvh.value = new MeshBVHUniformStruct();
				uniforms.bvh.value.updateFrom(new MeshBVH($.store_get($$store_subs ??= {}, '$parent', parent)?.geometry.clone().toNonIndexed(), { strategy: SAH }));
			}
		});

		useTask(
			() => {
				uniforms.viewMatrixInverse.value = camera.current.matrixWorld;
				uniforms.projectionMatrixInverse.value = camera.current.projectionMatrixInverse;
			},
			{ autoInvalidate: false }
		);

		const colorObj = new Color(color);

		T($$renderer, $.spread_props([
			{
				is: material,
				'uniforms.envMap.value': envMap,
				'uniforms.bounces.value': bounces,
				'uniforms.ior.value': ior,
				'uniforms.fresnel.value': fresnel,
				'uniforms.aberrationStrength.value': aberrationStrength,
				'uniforms.color.value': colorObj,
				'uniforms.resolution.value': [
					$.store_get($$store_subs ??= {}, '$size', size).width,
					$.store_get($$store_subs ??= {}, '$size', size).height
				],
				defines
			},
			props
		]));

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { ref });
	});
}
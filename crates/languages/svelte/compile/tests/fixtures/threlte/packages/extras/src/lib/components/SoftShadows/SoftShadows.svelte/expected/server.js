import * as $ from 'svelte/internal/server';
import { useThrelte } from '@threlte/core';
import { BasicShadowMap } from 'three';
import { ShaderChunk } from 'three';

const original = ShaderChunk.shadowmap_pars_fragment;
const isLegacyChunk = original.includes('unpackRGBAToDepth');

const sampleDepth = isLegacyChunk
	? 'unpackRGBAToDepth(texture2D(shadowMap, '
	: 'texture2D(shadowMap, ';

const sampleDepthSuffix = isLegacyChunk ? '))' : ').r';

export default function SoftShadows($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { renderer, scene } = useThrelte();

		/** Size of the light source (the larger the softer the light), default: 25 */
		/** Depth focus, use it to shift the focal point (where the shadow is the sharpest), default: 0 (the beginning) */
		/** Number of samples (more samples less noise but more expensive), default: 10 */
		let { size = 25, focus = 0, samples = 10 } = $$props;

		// 1.25 is folded into `size` so the inner filter loop avoids one multiply.
		const filterScale = $.derived(() => size * 1.25);

		const invSamples = $.derived(() => (1 / samples).toFixed(8));

		let pcss = $.derived(() => `
		// Hash from a single dot+fract; same statistical quality as the
		// 10-tap RGB high-pass it replaces, ~30x cheaper.
		float pcssNoise(vec2 position) {
			return fract(52.9829189 * fract(dot(position, vec2(0.06711056, 0.00583715))));
		}

		// Note: three.js's #pragma unroll_loop only substitutes "[ i ]"
		// subscripts and the UNROLLED_LOOP_INDEX token; bare i references
		// stay literal and won't compile. Use UNROLLED_LOOP_INDEX everywhere
		// the iteration index appears outside an array subscript, and hoist
		// any per-iteration declarations out of the loop body to avoid
		// "redefinition" errors after unrolling.

		vec2 vogelDiskSample(int sampleIndex, float angle) {
			const float goldenAngle = 2.399963f;
			float r = sqrt(float(sampleIndex) + 0.5) / sqrt(float(${samples}));
			float theta = float(sampleIndex) * goldenAngle + angle;
			return vec2(cos(theta), sin(theta)) * r;
		}

		float PCSS (sampler2D shadowMap, vec4 coords) {
			vec2 uv = coords.xy;
			float zReceiver = coords.z;
			float texelSize = 1.0 / float(textureSize(shadowMap, 0).x);

			float angle = pcssNoise(gl_FragCoord.xy) * PI2;

			// The blocker search and the penumbra filter both want N Vogel
			// samples around the same angle — only their scale differs. Compute
			// the unscaled offsets once instead of recomputing sin/cos per loop.
			vec2 offsets[${samples}];
			#pragma unroll_loop_start
			for (int i = 0; i < ${samples}; i++) {
				offsets[ i ] = vogelDiskSample(UNROLLED_LOOP_INDEX, angle) * texelSize;
			}
			#pragma unroll_loop_end

			// Blocker search.
			float blockerDepthSum = float(${focus});
			float blockers = 0.0;
			float blockerSearchScale = 2.0 * float(${size});
			vec2 offset;
			float depth;
			float isBlocker;
			#pragma unroll_loop_start
			for (int i = 0; i < ${samples}; i++) {
				offset = offsets[ i ] * blockerSearchScale;
				depth = ${sampleDepth}uv + offset${sampleDepthSuffix};
				// Branchless: 1 when depth < zReceiver (blocker), 0 otherwise.
				isBlocker = 1.0 - step(zReceiver, depth);
				blockerDepthSum += depth * isBlocker;
				blockers += isBlocker;
			}
			#pragma unroll_loop_end

			if (blockers == 0.0) return 1.0;

			float avgBlockerDepth = blockerDepthSum / blockers;
			float penumbraRatio = (zReceiver - avgBlockerDepth) / avgBlockerDepth;
			float filterMult = 1.0 + penumbraRatio * float(${filterScale()});

			float shadow = 0.0;
			#pragma unroll_loop_start
			for (int i = 0; i < ${samples}; i++) {
				offset = offsets[ i ] * filterMult;
				shadow += step(zReceiver, ${sampleDepth}uv + offset${sampleDepthSuffix});
			}
			#pragma unroll_loop_end

			return shadow * float(${invSamples()});
	}`);

		// Three.js's program cache key is derived from material properties, not
		// ShaderChunk source. To force a fresh compile against the modified chunk
		// we drop each material's renderer-side properties (which hold its program
		// ref) and empty the program cache. We avoid `material.dispose()` so user
		// `onBeforeCompile` injections and shared uniform references are preserved.
		const forceFreshCompile = (material) => {
			renderer.properties.remove(material);
			material.needsUpdate = true;
		};

		const recompile = () => {
			scene.traverse((object) => {
				const material = object.material;

				if (!material) return;

				if (Array.isArray(material)) {
					for (const m of material) forceFreshCompile(m);
				} else {
					forceFreshCompile(material);
				}
			});

			renderer.info.programs.length = 0;
		};
		// On modern (r183+) chunks the PCF branch binds the shadow map as
		// `sampler2DShadow`, which doesn't allow raw depth reads — PCSS needs
		// those, so force `BasicShadowMap` (which binds as `sampler2D`). Legacy
		// chunks use `sampler2D` for every shadow type, so we leave the user's
		// configured shadow type alone.
		// Legacy chunks have a single getShadow() with branches per shadow type;
		// inject right inside `if (frustumTest) {` ahead of the PCF branch so
		// the early `return` short-circuits whichever branch was selected.
		// Modern chunks have a dedicated BASIC getShadow() with a `sampler2D
		// shadowMap` that we can read raw depth from; inject before its depth
		// lookup so PCSS replaces the per-pixel comparison.
	});
}
import * as $ from 'svelte/internal/server';
import { observe, useTask, useThrelte } from '@threlte/core';
import { CSM } from 'three/examples/jsm/csm/CSM.js';
import { useMaterials } from './useMaterials.svelte.js';

export default function CSM_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		/**
		 * Whether or not CSM is enabled. If `enabled={false}`, a slot named
		 * `"disabled"` will be rendered.
		 */
		/**
		 * The arguments to pass to the CSM constructor.
		 */
		/**
		 * The camera to use for CSM. Defaults to the camera set by `makeDefault`.
		 */
		/**
		 * A configuration callback, which is triggered when CSM is activated. This
		 * callback facilitates advanced configurations, such as enabling the fade
		 * feature.
		 */
		let {
			enabled = true,
			args = {},
			camera,
			configure,
			lightIntensity,
			lightColor,
			lightDirection = [1, -1, 1],
			children,
			fallback
		} = $$props;

		const { camera: defaultCamera, scene, size } = useThrelte();
		let csm = void 0;

		useTask(() => csm?.update(), { autoInvalidate: false });

		const { onNewMaterial, allMaterials } = useMaterials();

		const disposeCsm = () => {
			csm?.remove();
			csm?.dispose();
			csm = undefined;
		};

		observe(() => [enabled], ([enabled]) => {
			if (enabled) {
				const nextCSM = new CSM({
					camera: camera ?? $.store_get($$store_subs ??= {}, '$defaultCamera', defaultCamera),
					parent: scene,
					...args
				});

				configure?.(nextCSM);

				for (const material of allMaterials) {
					nextCSM.setupMaterial(material);
				}

				onNewMaterial((material) => nextCSM.setupMaterial(material));
				csm = nextCSM;
			} else {
				onNewMaterial(undefined);
				disposeCsm();
			}
		});

		observe(() => [size, csm], ([, csm]) => {
			csm?.updateFrustums();
		});

		// set any CSM props that require frustum updates
		observe(() => [defaultCamera, camera, csm], ([defaultCamera, camera, csm]) => {
			if (!csm) return;

			csm.camera = camera ?? defaultCamera;

			if (args.maxFar !== undefined) csm.maxFar = args.maxFar;
			if (args.mode !== undefined) csm.mode = args.mode;

			csm.updateFrustums();
		});

		observe(() => [csm, lightIntensity, lightColor], ([csm, intensity, color]) => {
			csm?.lights.forEach((light) => {
				if (intensity !== undefined) {
					light.intensity = intensity / Math.PI;
				}

				if (color !== undefined) {
					light.color.set(color);
				}
			});
		});

		observe(() => [csm, lightDirection], ([csm, direction]) => {
			csm?.lightDirection.set(...direction).normalize();
		});

		children?.($$renderer);
		$$renderer.push(`<!----> `);

		if (!enabled) {
			$$renderer.push('<!--[0-->');
			fallback?.($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}
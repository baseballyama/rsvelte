import * as $ from 'svelte/internal/server';
import { isInstanceOf, T, useTask, useThrelte } from '@threlte/core';
import { Light, Object3D } from 'three';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js';
import HorizontalButtonGroup from '../../components/HorizontalButtonGroup.svelte';
import ToolbarButton from '../../components/ToolbarButton.svelte';
import ToolbarItem from '../../components/ToolbarItem.svelte';
import { useStudio } from '../../internal/extensions.js';
import { useObjectSelection } from '../object-selection/useObjectSelection.svelte.js';
import { useStudioObjectsRegistry } from '../studio-objects-registry/useStudioObjectsRegistry.svelte.js';
import { useTransactions } from '../transactions/useTransactions.js';
import AxesHelper from './AxesHelper.svelte';
import GroupHelper from './GroupHelper.svelte';
import Mounter from './Mounter.svelte';
import { helpersScope } from './types.js';

export default function Helpers($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;
		const { autoRenderTask } = useThrelte();
		const { createExtension } = useStudio();
		const { onTransaction } = useTransactions();

		const ext = createExtension({
			scope: helpersScope,
			state({ persist }) {
				return { enabled: persist(true) };
			},

			actions: {
				toggleEnabled({ state }) {
					state.enabled = !state.enabled;
				},

				setEnabled({ state }, enabled) {
					state.enabled = enabled;
				}
			}
		});

		const objectSelection = useObjectSelection();
		const { addObject, removeObject } = useStudioObjectsRegistry();
		const activeHelpers = new Set();

		useTask(
			() => {
				for (const helper of activeHelpers) {
					if ('update' in helper && typeof helper.update === 'function') {
						helper.update();
					}
				}
			},
			{ autoInvalidate: false, before: autoRenderTask }
		);

		const onCreate = (ref) => {
			addObject(ref);
			activeHelpers.add(ref);

			return () => {
				removeObject(ref);
				activeHelpers.delete(ref);
			};
		};

		const isLight = (object) => {
			return object.isLight;
		};

		let invalidations = 1;

		onTransaction(() => {
			invalidations++;
		});

		ToolbarItem($$renderer, {
			position: 'left',
			children: ($$renderer) => {
				HorizontalButtonGroup($$renderer, {
					children: ($$renderer) => {
						ToolbarButton($$renderer, {
							onclick: ext.toggleEnabled,
							active: ext.state.enabled,
							label: 'Helpers',
							icon: 'mdiFitToScreen',
							tooltip: 'Helpers'
						});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		if (ext.state.enabled) {
			$$renderer.push('<!--[0-->');
			AxesHelper($$renderer, { length: 999, width: 0.2 });
			$$renderer.push(`<!----> <!--[-->`);

			const each_array = $.ensure_array_like(objectSelection.selectedObjects);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let object = each_array[$$index];

				Mounter($$renderer, {
					parent: object,
					children: ($$renderer) => {
						AxesHelper($$renderer, { length: 0.5, width: 0.2, opacity: 0.3, overlay: true });
						$$renderer.push(`<!----> `);

						if (isInstanceOf(object, 'Group')) {
							$$renderer.push('<!--[0-->');
							GroupHelper($$renderer, { oncreate: onCreate });
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				if (isInstanceOf(object, 'Camera')) {
					$$renderer.push('<!--[0-->');

					if (T.CameraHelper) {
						$$renderer.push('<!--[-->');

						T.CameraHelper($$renderer, {
							userData: { ignoreOverrideMaterial: true },
							args: [object],
							oncreate: onCreate
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				} else if (isLight(object)) {
					$$renderer.push('<!--[1-->');

					if (object.shadow && invalidations && object.castShadow) {
						$$renderer.push('<!--[0-->');

						if (T.CameraHelper) {
							$$renderer.push('<!--[-->');

							T.CameraHelper($$renderer, {
								userData: { ignoreOverrideMaterial: true },
								args: [object.shadow.camera],
								oncreate: onCreate
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if ('isDirectionalLight' in object) {
						$$renderer.push('<!--[0-->');

						if (T.DirectionalLightHelper) {
							$$renderer.push('<!--[-->');

							T.DirectionalLightHelper($$renderer, {
								userData: { ignoreOverrideMaterial: true },
								args: [object, 10],
								oncreate: onCreate
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					} else if ('isSpotLight' in object) {
						$$renderer.push('<!--[1-->');

						if (T.SpotLightHelper) {
							$$renderer.push('<!--[-->');

							T.SpotLightHelper($$renderer, {
								userData: { ignoreOverrideMaterial: true },
								args: [object],
								oncreate: onCreate
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					} else if ('isPointLight' in object) {
						$$renderer.push('<!--[2-->');

						if (T.PointLightHelper) {
							$$renderer.push('<!--[-->');

							T.PointLightHelper($$renderer, {
								userData: { ignoreOverrideMaterial: true },
								args: [object, 10],
								oncreate: onCreate
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					} else if ('isHemisphereLight' in object) {
						$$renderer.push('<!--[3-->');

						if (T.HemisphereLightHelper) {
							$$renderer.push('<!--[-->');

							T.HemisphereLightHelper($$renderer, {
								userData: { ignoreOverrideMaterial: true },
								args: [object, 10],
								oncreate: onCreate
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					} else if ('isRectAreaLight' in object) {
						$$renderer.push('<!--[4-->');

						T($$renderer, {
							is: RectAreaLightHelper,
							userData: { ignoreOverrideMaterial: true },
							oncreate: onCreate,
							args: [object]
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);
		children?.($$renderer);
		$$renderer.push(`<!---->`);
	});
}
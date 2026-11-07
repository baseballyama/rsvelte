import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Helpers($$anchor, $$props) {
	$.push($$props, true);

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

	let invalidations = $.state(1);

	onTransaction(() => {
		$.update(invalidations);
	});

	var fragment = root_1();
	var node = $.first_child(fragment);

	ToolbarItem(node, {
		position: 'left',
		children: ($$anchor, $$slotProps) => {
			HorizontalButtonGroup($$anchor, {
				children: ($$anchor, $$slotProps) => {
					ToolbarButton($$anchor, {
						get onclick() {
							return ext.toggleEnabled;
						},

						get active() {
							return ext.state.enabled;
						},
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

	var node_1 = $.sibling(node, 2);

	{
		var consequent_9 = ($$anchor) => {
			var fragment_3 = root();
			var node_2 = $.first_child(fragment_3);

			AxesHelper(node_2, { length: 999, width: 0.2 });

			var node_3 = $.sibling(node_2, 2);

			$.each(node_3, 17, () => objectSelection.selectedObjects, (object) => object.uuid, ($$anchor, object) => {
				var fragment_4 = root();
				var node_4 = $.first_child(fragment_4);

				Mounter(node_4, {
					get parent() {
						return $.get(object);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_5 = root();
						var node_5 = $.first_child(fragment_5);

						AxesHelper(node_5, { length: 0.5, width: 0.2, opacity: 0.3, overlay: true });

						var node_6 = $.sibling(node_5, 2);

						{
							var consequent = ($$anchor) => {
								GroupHelper($$anchor, { oncreate: onCreate });
							};

							var d = $.derived(() => isInstanceOf($.get(object), 'Group'));

							$.if(node_6, ($$render) => {
								if ($.get(d)) $$render(consequent);
							});
						}

						$.append($$anchor, fragment_5);
					},
					$$slots: { default: true }
				});

				var node_7 = $.sibling(node_4, 2);

				{
					var consequent_1 = ($$anchor) => {
						var fragment_7 = $.comment();
						var node_8 = $.first_child(fragment_7);

						{
							let $0 = $.derived(() => [$.get(object)]);

							$.component(node_8, () => T.CameraHelper, ($$anchor, T_CameraHelper) => {
								T_CameraHelper($$anchor, {
									userData: { ignoreOverrideMaterial: true },
									get args() {
										return $.get($0);
									},
									oncreate: onCreate
								});
							});
						}

						$.append($$anchor, fragment_7);
					};

					var d_1 = $.derived(() => isInstanceOf($.get(object), 'Camera'));

					var consequent_8 = ($$anchor) => {
						var fragment_8 = root();
						var node_9 = $.first_child(fragment_8);

						{
							var consequent_2 = ($$anchor) => {
								var fragment_9 = $.comment();
								var node_10 = $.first_child(fragment_9);

								{
									let $0 = $.derived(() => [$.get(object).shadow.camera]);

									$.component(node_10, () => T.CameraHelper, ($$anchor, T_CameraHelper_1) => {
										T_CameraHelper_1($$anchor, {
											userData: { ignoreOverrideMaterial: true },
											get args() {
												return $.get($0);
											},
											oncreate: onCreate
										});
									});
								}

								$.append($$anchor, fragment_9);
							};

							$.if(node_9, ($$render) => {
								if ($.get(object).shadow && $.get(invalidations) && $.get(object).castShadow) $$render(consequent_2);
							});
						}

						var node_11 = $.sibling(node_9, 2);

						{
							var consequent_3 = ($$anchor) => {
								var fragment_10 = $.comment();
								var node_12 = $.first_child(fragment_10);

								{
									let $0 = $.derived(() => [$.get(object), 10]);

									$.component(node_12, () => T.DirectionalLightHelper, ($$anchor, T_DirectionalLightHelper) => {
										T_DirectionalLightHelper($$anchor, {
											userData: { ignoreOverrideMaterial: true },
											get args() {
												return $.get($0);
											},
											oncreate: onCreate
										});
									});
								}

								$.append($$anchor, fragment_10);
							};

							var consequent_4 = ($$anchor) => {
								var fragment_11 = $.comment();
								var node_13 = $.first_child(fragment_11);

								{
									let $0 = $.derived(() => [$.get(object)]);

									$.component(node_13, () => T.SpotLightHelper, ($$anchor, T_SpotLightHelper) => {
										T_SpotLightHelper($$anchor, {
											userData: { ignoreOverrideMaterial: true },
											get args() {
												return $.get($0);
											},
											oncreate: onCreate
										});
									});
								}

								$.append($$anchor, fragment_11);
							};

							var consequent_5 = ($$anchor) => {
								var fragment_12 = $.comment();
								var node_14 = $.first_child(fragment_12);

								{
									let $0 = $.derived(() => [$.get(object), 10]);

									$.component(node_14, () => T.PointLightHelper, ($$anchor, T_PointLightHelper) => {
										T_PointLightHelper($$anchor, {
											userData: { ignoreOverrideMaterial: true },
											get args() {
												return $.get($0);
											},
											oncreate: onCreate
										});
									});
								}

								$.append($$anchor, fragment_12);
							};

							var consequent_6 = ($$anchor) => {
								var fragment_13 = $.comment();
								var node_15 = $.first_child(fragment_13);

								{
									let $0 = $.derived(() => [$.get(object), 10]);

									$.component(node_15, () => T.HemisphereLightHelper, ($$anchor, T_HemisphereLightHelper) => {
										T_HemisphereLightHelper($$anchor, {
											userData: { ignoreOverrideMaterial: true },
											get args() {
												return $.get($0);
											},
											oncreate: onCreate
										});
									});
								}

								$.append($$anchor, fragment_13);
							};

							var consequent_7 = ($$anchor) => {
								{
									let $0 = $.derived(() => [$.get(object)]);

									T($$anchor, {
										get is() {
											return RectAreaLightHelper;
										},
										userData: { ignoreOverrideMaterial: true },
										oncreate: onCreate,
										get args() {
											return $.get($0);
										}
									});
								}
							};

							$.if(node_11, ($$render) => {
								if ('isDirectionalLight' in $.get(object)) $$render(consequent_3); else if ('isSpotLight' in $.get(object)) $$render(consequent_4, 1); else if ('isPointLight' in $.get(object)) $$render(consequent_5, 2); else if ('isHemisphereLight' in $.get(object)) $$render(consequent_6, 3); else if ('isRectAreaLight' in $.get(object)) $$render(consequent_7, 4);
							});
						}

						$.append($$anchor, fragment_8);
					};

					var d_2 = $.derived(() => isLight($.get(object)));

					$.if(node_7, ($$render) => {
						if ($.get(d_1)) $$render(consequent_1); else if ($.get(d_2)) $$render(consequent_8, 1);
					});
				}

				$.append($$anchor, fragment_4);
			});

			$.append($$anchor, fragment_3);
		};

		$.if(node_1, ($$render) => {
			if (ext.state.enabled) $$render(consequent_9);
		});
	}

	var node_16 = $.sibling(node_1, 2);

	$.snippet(node_16, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
}
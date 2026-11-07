import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { observe, T, useThrelte } from '@threlte/core';
import { onDestroy } from 'svelte';
import { Checkbox, RadioGrid } from 'svelte-tweakpane-ui';
import { Box3, OrthographicCamera, PerspectiveCamera, Sphere, Vector3 } from 'three';
import DropDownPane from '../../components/DropDownPane.svelte';
import HorizontalButtonGroup from '../../components/HorizontalButtonGroup.svelte';
import ToolbarButton from '../../components/ToolbarButton.svelte';
import ToolbarItem from '../../components/ToolbarItem.svelte';
import { useStudio } from '../../internal/extensions.js';
import { useObjectSelection } from '../object-selection/useObjectSelection.svelte.js';
import { useStudioObjectsRegistry } from '../studio-objects-registry/useStudioObjectsRegistry.svelte.js';
import CameraControls from './CameraControls.svelte';
import DefaultCamera from './DefaultCamera.svelte';
import { editorCameraScope } from './types.js';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function EditorCamera($$anchor, $$props) {
	$.push($$props, true);

	const $camera = () => $.store_get(camera, '$camera', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { createExtension } = useStudio();
	const { camera } = useThrelte();
	const { addObject, removeObject } = useStudioObjectsRegistry();
	const editorCameraPerspective = new PerspectiveCamera();

	editorCameraPerspective.userData.editorCamera = true;
	editorCameraPerspective.userData.perspective = true;
	addObject(editorCameraPerspective);

	const editorCameraOrthographic = new OrthographicCamera();

	editorCameraOrthographic.userData.editorCamera = true;
	editorCameraOrthographic.userData.orthographic = true;
	addObject(editorCameraOrthographic);

	onDestroy(() => {
		removeObject(editorCameraPerspective);
		removeObject(editorCameraOrthographic);
	});

	let cameraControls;
	const objectSelection = useObjectSelection();

	const extension = createExtension({
		scope: editorCameraScope,
		state({ persist }) {
			return {
				enabled: persist(false),
				mode: persist('Perspective'),
				position: persist([10, 10, 10]),
				target: persist([0, 0, 0]),
				defaultCamera: {
					object: undefined,
					enabled: persist(true),
					height: persist(240),
					width: persist(400)
				}
			};
		},

		actions: {
			toggleEnabled({ state }) {
				state.enabled = !state.enabled;
			},

			setEnabled({ state }, active) {
				state.enabled = active;
			},

			setOrthographic({ state }) {
				state.mode = 'Orthographic';
			},

			setPerspective({ state }) {
				state.mode = 'Perspective';
			},

			setEditorCameraTransform({ state }, position, target) {
				state.position = position;
				state.target = target;
			},

			setMode({ state }, mode) {
				state.mode = mode;
			},

			toggleMode({ state }) {
				state.mode = state.mode === 'Orthographic' ? 'Perspective' : 'Orthographic';
			},

			toggleDefaultCameraEnabled({ state }) {
				state.defaultCamera.enabled = !state.defaultCamera.enabled;
			},

			setDefaultCameraEnabled({ state }, enabled) {
				state.defaultCamera.enabled = enabled;
			},

			setDefaultCameraObject({ state }, object) {
				state.defaultCamera.object = object;
			},

			focusSelectedObjects() {
				if (!cameraControls) return;
				if (!objectSelection.selectedObjects.length) return;

				const box = new Box3();
				const centerAbs = new Vector3();

				objectSelection.selectedObjects.forEach((object) => {
					object.getWorldPosition(centerAbs);
					box.expandByPoint(centerAbs);
					box.expandByObject(object, false);
				});

				const sphere = new Sphere();

				box.getBoundingSphere(sphere);
				cameraControls.fitToSphere(sphere, true);
			}
		},

		keyMap({ shift }) {
			return {
				toggleEnabled: 'c',
				focusSelectedObjects: shift('f'),
				toggleDefaultCameraEnabled: shift('c')
			};
		}
	});

	const editorCameraPosition = $.derived(() => extension.state.position);
	const editorCameraTarget = $.derived(() => extension.state.target);
	const defaultCameraEnabled = $.derived(() => extension.state.defaultCamera.enabled);
	const editorCameraEnabled = $.derived(() => extension.state.enabled);
	const mode = $.derived(() => extension.state.mode);
	const editorCamera = $.derived(() => $.get(mode) === 'Orthographic' ? editorCameraOrthographic : editorCameraPerspective);
	const defaultCameraObject = $.derived(() => extension.state.defaultCamera.object);

	$.user_pre_effect(() => {
		if ($camera() !== editorCameraPerspective && $camera() !== editorCameraOrthographic) {
			extension.setDefaultCameraObject($camera());
		}
	});

	observe(
		() => [
			$.get(defaultCameraObject),
			$.get(editorCameraEnabled),
			$.get(editorCamera)
		],
		([defaultCameraObject, editorCameraEnabled, editorCamera]) => {
			if (editorCameraEnabled) {
				camera.set(editorCamera);
			} else if (defaultCameraObject) {
				camera.set(defaultCameraObject);
			}
		}
	);

	onDestroy(() => {
		if ($.get(defaultCameraObject)) camera.set($.get(defaultCameraObject));
	});

	let modes = ['Perspective', 'Orthographic'];

	const onModeChange = (mode) => {
		if (mode === 'Perspective') extension.setPerspective();
		if (mode === 'Orthographic') extension.setOrthographic();
	};

	var fragment = root_1();
	var node = $.first_child(fragment);

	ToolbarItem(node, {
		position: 'left',
		children: ($$anchor, $$slotProps) => {
			HorizontalButtonGroup($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node_1 = $.first_child(fragment_2);

					ToolbarButton(node_1, {
						get onclick() {
							return extension.toggleEnabled;
						},

						get active() {
							return $.get(editorCameraEnabled);
						},
						label: 'Editor Camera',
						icon: 'mdiCamera',
						tooltip: 'Editor Camera (C)'
					});

					var node_2 = $.sibling(node_1, 2);

					{
						let $0 = $.derived(() => objectSelection.selectedObjects.length === 0);

						ToolbarButton(node_2, {
							get onclick() {
								return extension.focusSelectedObjects;
							},

							get disabled() {
								return $.get($0);
							},
							label: 'Focus Selected',
							icon: 'mdiImageFilterCenterFocusStrongOutline',
							tooltip: 'Focus Selected (Shift+F)'
						});
					}

					var node_3 = $.sibling(node_2, 2);

					DropDownPane(node_3, {
						title: 'Settings',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_4 = $.first_child(fragment_3);

							RadioGrid(node_4, {
								get value() {
									return $.get(mode);
								},

								get values() {
									return modes;
								},

								$$events: {
									change: (e) => {
										onModeChange(e.detail.value);
									}
								}
							});

							var node_5 = $.sibling(node_4, 2);

							Checkbox(node_5, {
								get value() {
									return $.get(defaultCameraEnabled);
								},
								label: 'Default Camera',
								$$events: {
									change: (e) => {
										extension.setDefaultCameraEnabled(e.detail.value);
									}
								}
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node, 2);

	{
		var consequent_3 = ($$anchor) => {
			var fragment_4 = root();
			var node_7 = $.first_child(fragment_4);

			{
				var consequent = ($$anchor) => {
					T($$anchor, {
						get is() {
							return editorCameraPerspective;
						},

						children: ($$anchor, $$slotProps) => {
							{
								let $0 = $.derived(() => new Vector3(...$.get(editorCameraPosition)));
								let $1 = $.derived(() => new Vector3(...$.get(editorCameraTarget)));

								CameraControls($$anchor, {
									get camera() {
										return editorCameraPerspective;
									},

									get initialPosition() {
										return $.get($0);
									},

									get initialTarget() {
										return $.get($1);
									},

									rest: (payload) => {
										extension.setEditorCameraTransform(payload.position.toArray(), payload.target.toArray());
									},

									cc: (cc) => {
										cameraControls = cc;
									}
								});
							}
						},
						$$slots: { default: true }
					});
				};

				var consequent_1 = ($$anchor) => {
					T($$anchor, {
						zoom: 100,
						get is() {
							return editorCameraOrthographic;
						},

						children: ($$anchor, $$slotProps) => {
							{
								let $0 = $.derived(() => new Vector3(...$.get(editorCameraPosition)));
								let $1 = $.derived(() => new Vector3(...$.get(editorCameraTarget)));

								CameraControls($$anchor, {
									get camera() {
										return editorCameraOrthographic;
									},

									get initialPosition() {
										return $.get($0);
									},

									get initialTarget() {
										return $.get($1);
									},

									rest: (payload) => {
										extension.setEditorCameraTransform(payload.position.toArray(), payload.target.toArray());
									},

									cc: (cc) => {
										cameraControls = cc;
									}
								});
							}
						},
						$$slots: { default: true }
					});
				};

				$.if(node_7, ($$render) => {
					if ($.get(mode) === 'Perspective') $$render(consequent); else if ($.get(mode) === 'Orthographic') $$render(consequent_1, 1);
				});
			}

			var node_8 = $.sibling(node_7, 2);

			{
				var consequent_2 = ($$anchor) => {
					DefaultCamera($$anchor, {});
				};

				$.if(node_8, ($$render) => {
					if ($.get(defaultCameraEnabled)) $$render(consequent_2);
				});
			}

			$.append($$anchor, fragment_4);
		};

		$.if(node_6, ($$render) => {
			if ($.get(editorCameraEnabled)) $$render(consequent_3);
		});
	}

	var node_9 = $.sibling(node_6, 2);

	$.snippet(node_9, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}
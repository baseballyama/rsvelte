import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { injectPlugin, useThrelte } from '@threlte/core';
import { onMount } from 'svelte';
import { Checkbox, Element, RadioGrid } from 'svelte-tweakpane-ui';
import DropDownPane from '../../components/DropDownPane.svelte';
import HorizontalButtonGroup from '../../components/HorizontalButtonGroup.svelte';
import ToolbarButton from '../../components/ToolbarButton.svelte';
import ToolbarItem from '../../components/ToolbarItem.svelte';
import { useStudio } from '../../internal/extensions.js';
import { clientRpc } from '../../rpc/clientRpc.js';
import { useObjectSelection } from '../object-selection/useObjectSelection.svelte.js';
import Changes from './Changes.svelte';
import { getThrelteStudioUserData } from '../../internal/getThrelteStudioUserData.js';
import { TransactionQueue } from './TransactionQueue/TransactionQueue.svelte.js';
import { transactionsScope } from './types.js';
import { vitePluginEnabled } from './vitePluginEnabled.js';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Transactions($$anchor, $$props) {
	$.push($$props, true);

	const { createExtension } = useStudio();
	const { invalidate } = useThrelte();
	const applyToProperties = ['shadow', 'light', 'material', 'camera', 'target'];

	const insertStudioProps = (object, props) => {
		for (const key of Object.keys(object)) {
			if (applyToProperties.includes(key)) {
				const newProps = { ...props, pathItems: [...props.pathItems ?? [], key] };
				const hasUserData = 'userData' in object[key];
				const hasInspectorOptions = hasUserData && 'threlteStudio' in object[key].userData;

				if (!hasInspectorOptions) {
					if (hasUserData) {
						object[key].userData.threlteStudio = newProps;
					} else {
						object[key]['userData'] = { threlteStudio: newProps };
					}
				}

				insertStudioProps(object[key], newProps);
			}
		}
	};

	injectPlugin('sync', (args) => {
		if (!args.props.threlteStudio) return;

		if (typeof args.ref.userData === 'undefined') {
			args.ref.userData = {};
		}

		args.ref.userData.threlteStudio = args.props.threlteStudio;

		// go through the properties and apply the studio props to the properties
		// that are in the applyToProperties array
		onMount(() => {
			insertStudioProps(args.ref, args.props.threlteStudio);
		});

		return { pluginProps: ['threlteStudio'] };
	});

	const objectSelection = useObjectSelection();

	const extension = createExtension({
		scope: transactionsScope,
		state: ({ persist }) => {
			return {
				enabled: persist(true),
				mode: persist('auto'),
				precision: persist(4),
				queue: new TransactionQueue()
			};
		},

		actions: {
			toggleEnabled({ state }) {
				state.enabled = !state.enabled;
			},

			setEnabled({ state }, enabled) {
				state.enabled = enabled;
			},

			setMode({ state }, mode) {
				state.mode = mode;
			},

			setPrecision({ state }, precision) {
				state.precision = precision;
			},

			commit({ state }, transaction) {
				state.queue.commit(transaction);
				invalidate();
			},

			undo({ state }) {
				state.queue.undo();
				invalidate();
			},

			redo({ state }) {
				state.queue.redo();
				invalidate();
			},

			sync({ state }) {
				state.queue.sync();
			},

			async openInEditor(_, object) {
				if (!clientRpc) return;

				const userData = getThrelteStudioUserData(object);

				if (!userData) return;

				const pos = await clientRpc.getColumnAndRow(userData.moduleId, userData.index);
				const fileLoc = `${userData.moduleId}:${pos.row}:${pos.column + 1}`;

				fetch(`/__open-in-editor?file=${encodeURIComponent(fileLoc)}`);
			},

			openSelectedInEditor() {
				const objects = objectSelection.selectedObjects;

				if (objects.length !== 1) return;

				extension.openInEditor(objects[0]);
			}
		},

		keyMap({ meta, shift }) {
			return {
				undo: meta('z'),
				redo: shift(meta('z')),
				sync: meta('s'),
				openSelectedInEditor: meta('o')
			};
		}
	});

	$.user_effect(() => {
		if (extension.state.enabled && extension.state.mode === 'auto' && extension.state.queue.syncQueue.length) {
			extension.sync();
		}
	});

	const tooltip = $.derived(() => {
		if (!vitePluginEnabled) return 'Vite plugin not found';
		if (!extension.state.enabled) return 'Sync disabled';

		if (extension.state.mode === 'manual') {
			if (!extension.state.queue.syncQueue.length) return 'Up-to-date';

			return `Sync ${extension.state.queue.syncQueue.length} change${extension.state.queue.syncQueue.length > 1 ? 's' : ''}`;
		}

		return 'Auto-sync';
	});

	var fragment = root();
	var node = $.first_child(fragment);

	ToolbarItem(node, {
		position: 'right',
		children: ($$anchor, $$slotProps) => {
			HorizontalButtonGroup($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node_1 = $.first_child(fragment_2);

					{
						let $0 = $.derived(() => !vitePluginEnabled);
						let $1 = $.derived(() => extension.state.enabled && extension.state.mode === 'auto');
						let $2 = $.derived(() => extension.state.enabled && extension.state.mode === 'manual' && extension.state.queue.syncQueue.length > 0);
						let $3 = $.derived(() => !extension.state.enabled || extension.state.mode === 'auto');
						let $4 = $.derived(() => extension.state.mode === 'auto' && extension.state.queue.syncQueue.length > 0 ? 'mdiLoading' : 'mdiContentSave');

						ToolbarButton(node_1, {
							get error() {
								return $.get($0);
							},

							get success() {
								return $.get($1);
							},

							get warn() {
								return $.get($2);
							},

							get disabled() {
								return $.get($3);
							},

							get icon() {
								return $.get($4);
							},
							label: 'Sync',
							get tooltip() {
								return $.get(tooltip);
							},

							get onclick() {
								return extension.sync;
							}
						});
					}

					var node_2 = $.sibling(node_1, 2);

					DropDownPane(node_2, {
						title: 'Sync Settings',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_3 = $.first_child(fragment_3);

							Checkbox(node_3, {
								label: 'Enabled',
								get value() {
									return extension.state.enabled;
								},

								$$events: {
									change: (e) => {
										extension.setEnabled(e.detail.value);
									}
								}
							});

							var node_4 = $.sibling(node_3, 2);

							RadioGrid(node_4, {
								label: 'Mode',
								columns: 2,
								values: ['manual', 'auto'],
								get value() {
									return extension.state.mode;
								},

								$$events: {
									change: (e) => {
										extension.setMode(e.detail.value);
									}
								}
							});

							var node_5 = $.sibling(node_4, 2);

							Element(node_5, {
								children: ($$anchor, $$slotProps) => {
									Changes($$anchor, {});
								},
								$$slots: { default: true }
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

	ToolbarItem(node_6, {
		position: 'right',
		children: ($$anchor, $$slotProps) => {
			HorizontalButtonGroup($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_6 = root_1();
					var node_7 = $.first_child(fragment_6);

					{
						let $0 = $.derived(() => !extension.state.queue.canUndo);

						ToolbarButton(node_7, {
							icon: 'mdiUndo',
							label: 'Undo',
							get disabled() {
								return $.get($0);
							},
							tooltip: 'Undo (Cmd+Z)',
							get onclick() {
								return extension.undo;
							}
						});
					}

					var node_8 = $.sibling(node_7, 2);

					{
						let $0 = $.derived(() => !extension.state.queue.canRedo);

						ToolbarButton(node_8, {
							icon: 'mdiRedo',
							label: 'Redo',
							get disabled() {
								return $.get($0);
							},
							tooltip: 'Redo (Shift+Cmd+Z)',
							get onclick() {
								return extension.redo;
							}
						});
					}

					$.append($$anchor, fragment_6);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_6, 2);

	$.snippet(node_9, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
}
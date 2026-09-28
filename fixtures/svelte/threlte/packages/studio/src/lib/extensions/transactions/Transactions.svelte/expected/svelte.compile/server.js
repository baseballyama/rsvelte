import * as $ from 'svelte/internal/server';
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

export default function Transactions($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;
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

		const tooltip = $.derived(() => {
			if (!vitePluginEnabled) return 'Vite plugin not found';
			if (!extension.state.enabled) return 'Sync disabled';

			if (extension.state.mode === 'manual') {
				if (!extension.state.queue.syncQueue.length) return 'Up-to-date';

				return `Sync ${extension.state.queue.syncQueue.length} change${extension.state.queue.syncQueue.length > 1 ? 's' : ''}`;
			}

			return 'Auto-sync';
		});

		ToolbarItem($$renderer, {
			position: 'right',
			children: ($$renderer) => {
				HorizontalButtonGroup($$renderer, {
					children: ($$renderer) => {
						ToolbarButton($$renderer, {
							error: !vitePluginEnabled,
							success: extension.state.enabled && extension.state.mode === 'auto',
							warn: extension.state.enabled && extension.state.mode === 'manual' && extension.state.queue.syncQueue.length > 0,
							disabled: !extension.state.enabled || extension.state.mode === 'auto',
							icon: extension.state.mode === 'auto' && extension.state.queue.syncQueue.length > 0 ? 'mdiLoading' : 'mdiContentSave',
							label: 'Sync',
							tooltip: tooltip(),
							onclick: extension.sync
						});

						$$renderer.push(`<!----> `);

						DropDownPane($$renderer, {
							title: 'Sync Settings',
							children: ($$renderer) => {
								Checkbox($$renderer, { label: 'Enabled', value: extension.state.enabled });
								$$renderer.push(`<!----> `);

								RadioGrid($$renderer, {
									label: 'Mode',
									columns: 2,
									values: ['manual', 'auto'],
									value: extension.state.mode
								});

								$$renderer.push(`<!----> `);

								Element($$renderer, {
									children: ($$renderer) => {
										Changes($$renderer, {});
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		ToolbarItem($$renderer, {
			position: 'right',
			children: ($$renderer) => {
				HorizontalButtonGroup($$renderer, {
					children: ($$renderer) => {
						ToolbarButton($$renderer, {
							icon: 'mdiUndo',
							label: 'Undo',
							disabled: !extension.state.queue.canUndo,
							tooltip: 'Undo (Cmd+Z)',
							onclick: extension.undo
						});

						$$renderer.push(`<!----> `);

						ToolbarButton($$renderer, {
							icon: 'mdiRedo',
							label: 'Redo',
							disabled: !extension.state.queue.canRedo,
							tooltip: 'Redo (Shift+Cmd+Z)',
							onclick: extension.redo
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);
		children?.($$renderer);
		$$renderer.push(`<!---->`);
	});
}
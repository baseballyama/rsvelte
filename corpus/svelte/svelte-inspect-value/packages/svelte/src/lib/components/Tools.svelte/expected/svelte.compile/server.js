import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';
import { globalInspectState } from '../Panel.svelte';
import { getAddDestroyCallbackFn } from '../contexts.js';
import { globalValues } from '../global.svelte.js';
import { copyToClipBoard, logToConsole } from '../hello.svelte.js';
import { useOptions } from '../options.svelte.js';
import { useState } from '../state.svelte.js';
import { isPromise, stringifyPath, wait } from '../util.js';
import { buildSearchIndex } from '../util/search.js';
import NodeIconButton from './NodeIconButton.svelte';
import * as icons from './icons/index.js';

export default function Tools($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value, type = '', path = [] } = $$props;
		let copied = false;
		const SIV_DEBUG = getContext(Symbol.for('SIV.DEBUG'));
		const fixed = getContext(Symbol.for('siv.fixed'));
		const addOnDestroyCallback = getAddDestroyCallbackFn();
		let options = useOptions();

		let $$d = $.derived(() => options.value),
			onCopy = $.derived(() => $$d().onCopy),
			canCopy = $.derived(() => $$d().canCopy),
			onLog = $.derived(() => $$d().onLog),
			showTools = $.derived(() => $$d().showTools);

		let inspectState = useState();
		let stringifiedPath = $.derived(() => stringifyPath(path));
		let level = $.derived(() => path.length);
		let settingCollapse = false;

		let showCopyButton = $.derived(() => {
			if (onCopy()) {
				if (canCopy()) return canCopy()(value, type, path);

				return true;
			}

			return [
				'array',
				'object',
				'number',
				'bigint',
				'string',
				'undefined',
				'null',
				'date',
				'boolean'
			].includes(type ?? '');
		});

		let nodeState = $.derived(() => inspectState.value[stringifyPath(path)]);
		let childNodes = $.derived(() => Object.entries(inspectState.value).filter(([k]) => k.startsWith(stringifiedPath()) && k.split('.').length === level() + 1));
		let hasExpandedChildren = $.derived(() => childNodes().some(([, state]) => !state.collapsed));
		let hasChildren = $.derived(() => childNodes().length > 0);
		let copyTimeout = void 0;

		function onCopySuccess() {
			copied = true;

			if (copyTimeout) window.clearTimeout(copyTimeout);

			copyTimeout = window.setTimeout(
				() => {
					copied = false;
				},
				5000
			);
		}

		async function runCustomCopy() {
			let ret;

			try {
				ret = onCopy()($.snapshot(value), $.snapshot(type), $.snapshot(path));

				if (isPromise(ret)) {
					const wasCopied = await ret;

					if (wasCopied) onCopySuccess();
				} else if (typeof ret === 'boolean') {
					if (ret) onCopySuccess();
				}
			} catch(e) {
				console.error('[Inspect] error running custom onCopy callback:', e);
				copied = false;
			}
		}

		async function copy() {
			if (onCopy()) {
				runCustomCopy();
			} else {
				try {
					await copyToClipBoard(value, type);
					onCopySuccess();
				} catch(e) {
					console.error(e);
					copied = false;
				}
			}
		}

		function log() {
			if (onLog()) {
				onLog()(value, type, path);
			} else {
				logToConsole(path, value, type);
			}
		}

		const collapseAction = {
			hint: 'Collapse children',
			action: async () => {
				settingCollapse = 'collapsing';

				for (const [path, state] of childNodes().toReversed()) {
					if (!state.collapsed) {
						inspectState.setCollapse(path, { collapsed: true });
						await wait();
					}
				}

				settingCollapse = false;
			},
			expand: false
		};

		const expandAction = {
			hint: 'Expand children',
			action: async () => {
				settingCollapse = 'expanding';

				for (const [path, state] of childNodes()) {
					if (state.collapsed) {
						inspectState.setCollapse(path, { collapsed: false });
						await wait();
					}
				}

				settingCollapse = false;
			},
			expand: true
		};

		let expandSelfAndChildrenAction = {
			hint: 'Expand node and children',
			action: async () => {
				inspectState.setCollapse(stringifiedPath(), { collapsed: false });
				expandAction.action();
			},
			expand: true
		};

		function getTreeAction(nodeState) {
			if (nodeState) {
				if (nodeState.collapsed) {
					return expandSelfAndChildrenAction;
				}

				if (hasChildren()) {
					return hasExpandedChildren() ? collapseAction : expandAction;
				}
			}

			return undefined;
		}

		let treeAction = $.derived(() => getTreeAction(nodeState()));

		let panelValueAction = $.derived(() => {
			if (globalInspectState.mounted.size) {
				if (globalValues.has(stringifiedPath())) {
					return {
						add: false,
						hint: 'Remove from panel',
						action: () => {
							globalValues.delete(stringifiedPath());
						}
					};
				} else if (!fixed) {
					return {
						add: true,
						hint: 'Add to panel',
						action: () => {
							globalValues.set(stringifiedPath(), {
								get value() {
									return value;
								},
								note: { title: 'Added manually' }
							});

							addOnDestroyCallback(() => {
								globalValues.delete(stringifiedPath());
							});
						}
					};
				}
			}

			return undefined;
		});

		function debugNode() {
			const { log } = console;

			log({
				globalInspectState,
				indexed: buildSearchIndex({ value, options: options.value })
			});
		}

		if (showTools()) {
			$$renderer.push(`<!--[0--><div class="tools svelte-201b35">`);

			if (SIV_DEBUG?.()) {
				$$renderer.push('<!--[0-->');

				NodeIconButton($$renderer, {
					onclick: debugNode,
					children: ($$renderer) => {
						$$renderer.push(`<!---->?`);
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (panelValueAction()) {
				$$renderer.push('<!--[0-->');

				NodeIconButton($$renderer, {
					title: panelValueAction().hint,
					onclick: panelValueAction().action,
					children: ($$renderer) => {
						if (icons.PanelValue) {
							$$renderer.push('<!--[-->');
							icons.PanelValue($$renderer, { add: panelValueAction().add });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (treeAction()) {
				$$renderer.push('<!--[0-->');

				NodeIconButton($$renderer, {
					disabled: settingCollapse !== false,
					title: treeAction().hint,
					'aria-label': treeAction().hint,
					onclick: treeAction().action,
					children: ($$renderer) => {
						if (icons.ExpandCollapse) {
							$$renderer.push('<!--[-->');
							icons.ExpandCollapse($$renderer, { expand: treeAction()?.expand, setting: settingCollapse });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			NodeIconButton($$renderer, {
				title: 'Log value to console',
				'aria-label': 'Log value to console',
				onclick: () => log(),
				style: 'font-size: 1em;width: 1.5em; height: 1.5em;',
				children: ($$renderer) => {
					if (icons.Console) {
						$$renderer.push('<!--[-->');
						icons.Console($$renderer, {});
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			if (showCopyButton()) {
				$$renderer.push('<!--[0-->');

				NodeIconButton($$renderer, {
					title: 'Copy value to clipboard',
					'aria-label': 'Copy value to clipboard',
					onclick: () => copy(),
					success: copied,
					children: ($$renderer) => {
						if (icons.Clipboard) {
							$$renderer.push('<!--[-->');
							icons.Clipboard($$renderer, { copied });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}
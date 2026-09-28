import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div class="tools svelte-201b35"><!> <!> <!> <!> <!></div>`);

export default function Tools($$anchor, $$props) {
	$.push($$props, true);

	let type = $.prop($$props, 'type', 3, ''),
		path = $.prop($$props, 'path', 19, () => []);

	let copied = $.state(false);
	const SIV_DEBUG = getContext(Symbol.for('SIV.DEBUG'));
	const fixed = getContext(Symbol.for('siv.fixed'));
	const addOnDestroyCallback = getAddDestroyCallbackFn();
	let options = useOptions();

	let $$d = $.derived(() => options.value),
		onCopy = $.derived(() => $.get($$d).onCopy),
		canCopy = $.derived(() => $.get($$d).canCopy),
		onLog = $.derived(() => $.get($$d).onLog),
		showTools = $.derived(() => $.get($$d).showTools);

	let inspectState = useState();
	let stringifiedPath = $.derived(() => stringifyPath(path()));
	let level = $.derived(() => path().length);
	let settingCollapse = $.state(false);

	let showCopyButton = $.derived(() => {
		if ($.get(onCopy)) {
			if ($.get(canCopy)) return $.get(canCopy)($$props.value, type(), path());

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
		].includes(type() ?? '');
	});

	let nodeState = $.derived(() => inspectState.value[stringifyPath(path())]);
	let childNodes = $.derived(() => Object.entries(inspectState.value).filter(([k]) => k.startsWith($.get(stringifiedPath)) && k.split('.').length === $.get(level) + 1));
	let hasExpandedChildren = $.derived(() => $.get(childNodes).some(([, state]) => !state.collapsed));
	let hasChildren = $.derived(() => $.get(childNodes).length > 0);
	let copyTimeout = $.state(void 0);

	function onCopySuccess() {
		$.set(copied, true);

		if ($.get(copyTimeout)) window.clearTimeout($.get(copyTimeout));

		$.set(
			copyTimeout,
			window.setTimeout(
				() => {
					$.set(copied, false);
				},
				5000
			),
			true
		);
	}

	async function runCustomCopy() {
		let ret;

		try {
			ret = $.get(onCopy)($.snapshot($$props.value), $.snapshot(type()), $.snapshot(path()));

			if (isPromise(ret)) {
				const wasCopied = await ret;

				if (wasCopied) onCopySuccess();
			} else if (typeof ret === 'boolean') {
				if (ret) onCopySuccess();
			}
		} catch(e) {
			console.error('[Inspect] error running custom onCopy callback:', e);
			$.set(copied, false);
		}
	}

	async function copy() {
		if ($.get(onCopy)) {
			runCustomCopy();
		} else {
			try {
				await copyToClipBoard($$props.value, type());
				onCopySuccess();
			} catch(e) {
				console.error(e);
				$.set(copied, false);
			}
		}
	}

	function log() {
		if ($.get(onLog)) {
			$.get(onLog)($$props.value, type(), path());
		} else {
			logToConsole(path(), $$props.value, type());
		}
	}

	const collapseAction = {
		hint: 'Collapse children',
		action: async () => {
			$.set(settingCollapse, 'collapsing');

			for (const [path, state] of $.get(childNodes).toReversed()) {
				if (!state.collapsed) {
					inspectState.setCollapse(path, { collapsed: true });
					await wait();
				}
			}

			$.set(settingCollapse, false);
		},
		expand: false
	};

	const expandAction = {
		hint: 'Expand children',
		action: async () => {
			$.set(settingCollapse, 'expanding');

			for (const [path, state] of $.get(childNodes)) {
				if (state.collapsed) {
					inspectState.setCollapse(path, { collapsed: false });
					await wait();
				}
			}

			$.set(settingCollapse, false);
		},
		expand: true
	};

	let expandSelfAndChildrenAction = {
		hint: 'Expand node and children',
		action: async () => {
			inspectState.setCollapse($.get(stringifiedPath), { collapsed: false });
			expandAction.action();
		},
		expand: true
	};

	function getTreeAction(nodeState) {
		if (nodeState) {
			if (nodeState.collapsed) {
				return expandSelfAndChildrenAction;
			}

			if ($.get(hasChildren)) {
				return $.get(hasExpandedChildren) ? collapseAction : expandAction;
			}
		}

		return undefined;
	}

	let treeAction = $.derived(() => getTreeAction($.get(nodeState)));

	let panelValueAction = $.derived(() => {
		if (globalInspectState.mounted.size) {
			if (globalValues.has($.get(stringifiedPath))) {
				return {
					add: false,
					hint: 'Remove from panel',
					action: () => {
						globalValues.delete($.get(stringifiedPath));
					}
				};
			} else if (!fixed) {
				return {
					add: true,
					hint: 'Add to panel',
					action: () => {
						globalValues.set($.get(stringifiedPath), {
							get value() {
								return $$props.value;
							},
							note: { title: 'Added manually' }
						});

						addOnDestroyCallback(() => {
							globalValues.delete($.get(stringifiedPath));
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
			indexed: buildSearchIndex({ value: $$props.value, options: options.value })
		});
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_4 = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			{
				var consequent = ($$anchor) => {
					NodeIconButton($$anchor, {
						onclick: debugNode,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('?');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				};

				var d = $.derived(() => SIV_DEBUG?.());

				$.if(node_1, ($$render) => {
					if ($.get(d)) $$render(consequent);
				});
			}

			var node_2 = $.sibling(node_1, 2);

			{
				var consequent_1 = ($$anchor) => {
					NodeIconButton($$anchor, {
						get title() {
							return $.get(panelValueAction).hint;
						},

						get onclick() {
							return $.get(panelValueAction).action;
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_3 = $.first_child(fragment_3);

							$.component(node_3, () => icons.PanelValue, ($$anchor, icons_PanelValue) => {
								icons_PanelValue($$anchor, {
									get add() {
										return $.get(panelValueAction).add;
									}
								});
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				};

				$.if(node_2, ($$render) => {
					if ($.get(panelValueAction)) $$render(consequent_1);
				});
			}

			var node_4 = $.sibling(node_2, 2);

			{
				var consequent_2 = ($$anchor) => {
					{
						let $0 = $.derived(() => $.get(settingCollapse) !== false);

						NodeIconButton($$anchor, {
							get disabled() {
								return $.get($0);
							},

							get title() {
								return $.get(treeAction).hint;
							},

							get 'aria-label'() {
								return $.get(treeAction).hint;
							},

							get onclick() {
								return $.get(treeAction).action;
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_5 = $.comment();
								var node_5 = $.first_child(fragment_5);

								{
									let $0 = $.derived(() => $.get(treeAction)?.expand);

									$.component(node_5, () => icons.ExpandCollapse, ($$anchor, icons_ExpandCollapse) => {
										icons_ExpandCollapse($$anchor, {
											get expand() {
												return $.get($0);
											},

											get setting() {
												return $.get(settingCollapse);
											}
										});
									});
								}

								$.append($$anchor, fragment_5);
							},
							$$slots: { default: true }
						});
					}
				};

				$.if(node_4, ($$render) => {
					if ($.get(treeAction)) $$render(consequent_2);
				});
			}

			var node_6 = $.sibling(node_4, 2);

			NodeIconButton(node_6, {
				title: 'Log value to console',
				'aria-label': 'Log value to console',
				onclick: () => log(),
				style: 'font-size: 1em;width: 1.5em; height: 1.5em;',
				children: ($$anchor, $$slotProps) => {
					var fragment_6 = $.comment();
					var node_7 = $.first_child(fragment_6);

					$.component(node_7, () => icons.Console, ($$anchor, icons_Console) => {
						icons_Console($$anchor, {});
					});

					$.append($$anchor, fragment_6);
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_6, 2);

			{
				var consequent_3 = ($$anchor) => {
					NodeIconButton($$anchor, {
						title: 'Copy value to clipboard',
						'aria-label': 'Copy value to clipboard',
						onclick: () => copy(),
						get success() {
							return $.get(copied);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_8 = $.comment();
							var node_9 = $.first_child(fragment_8);

							$.component(node_9, () => icons.Clipboard, ($$anchor, icons_Clipboard) => {
								icons_Clipboard($$anchor, {
									get copied() {
										return $.get(copied);
									}
								});
							});

							$.append($$anchor, fragment_8);
						},
						$$slots: { default: true }
					});
				};

				$.if(node_8, ($$render) => {
					if ($.get(showCopyButton)) $$render(consequent_3);
				});
			}

			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(showTools)) $$render(consequent_4);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}
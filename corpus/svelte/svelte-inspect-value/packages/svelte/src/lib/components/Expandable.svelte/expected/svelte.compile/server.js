import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { scope } from '../attachments/focus.js';
import { getIsKey, getPreviewLevel } from '../contexts.js';
import { useOptions } from '../options.svelte.js';
import { useState } from '../state.svelte.js';
import { slideXY } from '../transition/index.js';
import { neverExpandInitial, shouldInitiallyExpandNode, stringifyPath } from '../util.js';
import CollapseButton from './CollapseButton.svelte';
import Count from './Count.svelte';
import Key from './Key.svelte';
import NodeNote from './NodeNote.svelte';
import Row from './Row.svelte';
import Tools from './Tools.svelte';
import Type from './Type.svelte';

export default function Expandable($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			key,
			keyPrefix,
			keyDelim = ':',
			keyStyle,
			showKey = true,
			type,
			length,
			value,
			valuePreview,
			forceType = false,
			keepPreviewOnExpand = false,
			path = [],
			showLength = true,
			children,
			note,
			match,
			$$slots,
			$$events,
			...rest
		} = $$props;

		let collapseButton = void 0;
		const options = useOptions();
		const inspectState = useState();
		const previewLevel = getPreviewLevel();
		const isKey = getIsKey();

		let $$d = $.derived(() => options.value),
			expandAll = $.derived(() => $$d().expandAll),
			expandPaths = $.derived(() => $$d().expandPaths),
			optsShowLength = $.derived(() => $$d().showLength),
			borderless = $.derived(() => $$d().borderless),
			easing = $.derived(() => $$d().easing);

		let expandingDisabled = $.derived(() => length === 0 || previewLevel > 0);
		let stringifiedPath = $.derived(() => stringifyPath(path));
		let collapseState = $.derived(() => inspectState.value[stringifiedPath()]);

		let collapsed = $.derived(() => {
			if (previewLevel || !length) return true;

			if (collapseState()) {
				return collapseState().collapsed;
			}

			// while waiting for onMount to run, check expandLevel.
			// this avoids playing the indent intro animation.
			return path.length > options.expandLevel || neverExpandInitial.includes(key);
		});

		onMount(() => {
			if (previewLevel) return;

			if (inspectState && previewLevel === 0) {
				const storedState = inspectState.getCollapse(path);

				if (!storedState) {
					inspectState.setCollapse(path, {
						collapsed: !shouldInitiallyExpandNode(path, options.expandLevel, expandAll(), expandPaths())
					});
				}
			}
		});

		function setCollapse(collapsed) {
			if (!expandingDisabled()) {
				inspectState.setCollapse(stringifiedPath(), { collapsed });
			}
		}

		let shouldRenderChildren = $.derived(() => {
			if (match && type !== 'string' && type !== 'function') {
				return length != null && length > 0 && !previewLevel;
			} else {
				return length != null && length > 0 && !collapsed() && !previewLevel;
			}
		});

		function flash() {
			collapseButton?.flashButton();
		}

		$$renderer.push(`<div${$.attributes(
			{
				'data-testid': 'expandable',
				class: $.clsx([
					'line',
					previewLevel && 'preview',
					!showKey && 'nokey',
					match && 'match'
				]),
				'aria-expanded': !collapsed(),
				...rest
			},
			'svelte-cc7f82'
		)}>`);

		Row($$renderer, {
			collapsed: collapsed(),
			previewLevel,
			borderless: borderless(),
			disabled: expandingDisabled(),
			onchange: setCollapse,
			isFocusTarget: previewLevel === 0,
			children: ($$renderer) => {
				if (!previewLevel && !isKey) {
					$$renderer.push('<!--[0-->');

					CollapseButton($$renderer, {
						collapsed: collapsed(),
						value,
						key,
						type,
						disabled: expandingDisabled()
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (showKey) {
					$$renderer.push('<!--[0-->');

					Key($$renderer, {
						disabled: expandingDisabled(),
						delim: keyDelim,
						prefix: keyPrefix,
						style: keyStyle,
						key,
						path
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (!isKey) {
					$$renderer.push('<!--[0-->');
					Type($$renderer, { type, force: forceType });
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				valuePreview($$renderer, {
					showPreview: collapsed() || previewLevel > 0 || keepPreviewOnExpand
				});

				$$renderer.push(`<!----> `);

				if (note && !previewLevel) {
					$$renderer.push('<!--[0-->');

					NodeNote($$renderer, {
						style: 'justify-self: right;',
						title: note.description,
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(note.title)}`);
						},
						$$slots: { default: true }
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (typeof length === 'number' && showLength && optsShowLength() && !previewLevel) {
					$$renderer.push('<!--[0-->');
					Count($$renderer, { length, type });
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		if (!previewLevel) {
			$$renderer.push('<!--[0-->');
			Tools($$renderer, { value, path, collapsed: collapsed(), type });
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> `);

		if (children && shouldRenderChildren()) {
			$$renderer.push(`<!--[0--><div role="list" data-testid="indent"${$.attr_class($.clsx(['indent', type, match && 'match']), 'svelte-cc7f82')}>`);
			children($$renderer);
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { flash });
	});
}
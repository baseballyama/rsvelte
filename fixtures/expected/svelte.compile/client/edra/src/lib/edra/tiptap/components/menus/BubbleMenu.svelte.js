import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { untrack } from 'svelte';
import { BubbleMenuPlugin } from '@tiptap/extension-bubble-menu';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'editor',
	'pluginKey',
	'updateDelay',
	'resizeDelay',
	'options',
	'appendTo',
	'shouldShow',
	'getReferencedVirtualElement',
	'children',
	'class'
]);

var root = $.from_html(`<div><!></div>`);

export default function BubbleMenu($$anchor, $$props) {
	$.push($$props, true);

	let pluginKey = $.prop($$props, 'pluginKey', 3, 'bubbleMenu'),
		updateDelay = $.prop($$props, 'updateDelay', 3, undefined),
		resizeDelay = $.prop($$props, 'resizeDelay', 3, undefined),
		options = $.prop($$props, 'options', 19, () => ({})),
		appendTo = $.prop($$props, 'appendTo', 3, undefined),
		shouldShow = $.prop($$props, 'shouldShow', 3, null),
		getReferencedVirtualElement = $.prop($$props, 'getReferencedVirtualElement', 3, undefined),
		rest = $.rest_props($$props, rest_excludes);

	let rootEl = $.state(void 0);
	let registered = false;

	$.user_effect(() => {
		if (!$.get(rootEl) || !$$props.editor) {
			return;
		}

		// Guard against Hot re-runs driven by reactive reads (e.g. transaction version)
		if (registered) {
			return;
		}

		registered = true;

		const el = $.get(rootEl);

		untrack(() => {
			el.style.visibility = 'hidden';
			el.style.position = 'absolute';
			el.remove();

			$$props.editor.registerPlugin(BubbleMenuPlugin({
				editor: $$props.editor,
				element: el,
				options: options(),
				pluginKey: pluginKey(),
				resizeDelay: resizeDelay(),
				appendTo: appendTo(),
				shouldShow: shouldShow(),
				getReferencedVirtualElement: getReferencedVirtualElement(),
				updateDelay: updateDelay()
			}));
		});

		return () => {
			registered = false;

			try {
				$$props.editor.unregisterPlugin(pluginKey());
			} catch {
				// editor may already be destroyed during navigation
			}
		};
	});

	var div = root();

	$.attribute_effect(div, () => ({ class: $$props.class, ...rest }));

	var node = $.child(div);

	$.snippet(node, () => $$props.children);
	$.reset(div);
	$.bind_this(div, ($$value) => $.set(rootEl, $$value), () => $.get(rootEl));
	$.append($$anchor, div);
	$.pop();
}
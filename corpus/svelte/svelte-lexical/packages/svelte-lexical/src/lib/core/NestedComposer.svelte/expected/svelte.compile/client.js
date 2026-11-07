import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createSharedNodeState } from 'lexical';
import { onMount, setContext } from 'svelte';

export default function NestedComposer($$anchor, $$props) {
	$.push($$props, true);

	// unlike Composer, a NestedComposer doesn't create the editor, it is passed to it
	let initialEditor = $.prop($$props, 'initialEditor', 15),
		initialTheme = $.prop($$props, 'initialTheme', 3, null);

	function getTransformSetFromKlass(klass) {
		const transform = klass.transform();

		return transform !== null ? new Set([transform]) : new Set();
	}

	setContext('editor', initialEditor());

	const composerTheme = initialTheme() || $$props.parentEditor._config.theme;

	if (composerTheme) {
		initialEditor(initialEditor()._config.theme = composerTheme, true);
	}

	initialEditor(initialEditor()._parentEditor = $$props.parentEditor, true);

	const parentNodes = initialEditor(initialEditor()._nodes = new Map($$props.parentEditor._nodes), true);

	for (const [type, entry] of parentNodes) {
		initialEditor()._nodes.set(type, {
			exportDOM: entry.exportDOM,
			klass: entry.klass,
			replace: entry.replace,
			replaceWithKlass: entry.replaceWithKlass,
			sharedNodeState: createSharedNodeState(entry.klass),
			transforms: getTransformSetFromKlass(entry.klass)
		});
	}

	initialEditor(initialEditor()._config.namespace = $$props.parentEditor._config.namespace, true);
	initialEditor(initialEditor()._editable = $$props.parentEditor._editable, true);

	onMount(() => {
		return $$props.parentEditor.registerEditableListener((editable) => {
			initialEditor().setEditable(editable);
		});
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
}
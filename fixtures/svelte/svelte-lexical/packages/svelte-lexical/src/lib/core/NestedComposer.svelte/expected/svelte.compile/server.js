import * as $ from 'svelte/internal/server';
import { createSharedNodeState } from 'lexical';
import { onMount, setContext } from 'svelte';

export default function NestedComposer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// unlike Composer, a NestedComposer doesn't create the editor, it is passed to it
		let {
			initialEditor = void 0,
			parentEditor,
			initialTheme = null,
			children
		} = $$props;

		function getTransformSetFromKlass(klass) {
			const transform = klass.transform();

			return transform !== null ? new Set([transform]) : new Set();
		}

		setContext('editor', initialEditor);

		const composerTheme = initialTheme || parentEditor._config.theme;

		if (composerTheme) {
			initialEditor._config.theme = composerTheme;
		}

		initialEditor._parentEditor = parentEditor;

		const parentNodes = initialEditor._nodes = new Map(parentEditor._nodes);

		for (const [type, entry] of parentNodes) {
			initialEditor._nodes.set(type, {
				exportDOM: entry.exportDOM,
				klass: entry.klass,
				replace: entry.replace,
				replaceWithKlass: entry.replaceWithKlass,
				sharedNodeState: createSharedNodeState(entry.klass),
				transforms: getTransformSetFromKlass(entry.klass)
			});
		}

		initialEditor._config.namespace = parentEditor._config.namespace;
		initialEditor._editable = parentEditor._editable;

		onMount(() => {
			return parentEditor.registerEditableListener((editable) => {
				initialEditor.setEditable(editable);
			});
		});

		children?.($$renderer);
		$$renderer.push(`<!---->`);
		$.bind_props($$props, { initialEditor });
	});
}
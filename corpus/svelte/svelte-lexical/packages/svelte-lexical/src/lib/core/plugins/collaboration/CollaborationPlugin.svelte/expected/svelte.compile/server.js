import * as $ from 'svelte/internal/server';
import { useCollaborationContext } from './CollaborationContext.js';
import { getEditor } from '../../composerContext.js';
import { createBinding } from '@lexical/yjs';
import { onMount } from 'svelte';
import YjsCollaboration from './YjsCollaboration.svelte';
import YjsHistory from './YjsHistory.svelte';
import YjsFocusTracking from './YjsFocusTracking.svelte';

export default function CollaborationPlugin($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const editor = getEditor();

		let {
			id = editor.getKey(),
			providerFactory,
			shouldBootstrap,
			username = undefined,
			cursorColor = undefined,
			cursorsContainerRef = null,
			initialEditorState = null,
			excludedProperties = undefined,
			awarenessData = undefined,
			syncCursorPositionsFn = undefined
		} = $$props;

		const collabContext = useCollaborationContext(username, cursorColor);
		const { yjsDocMap, name, color } = collabContext;
		const provider = providerFactory(id, yjsDocMap);
		const doc = yjsDocMap.get(id);
		const binding = createBinding(editor, provider, id, doc, yjsDocMap, excludedProperties);

		collabContext.clientID = binding.clientID;
		collabContext.isCollabActive = true;

		onMount(() => {
			return () => {
				// Reseting flag only when unmount top level editor collab plugin. Nested
				// editors (e.g. image caption) should unmount without affecting it
				if (editor._parentEditor == null) {
					collabContext.isCollabActive = false;
				}
			};
		});

		YjsCollaboration($$renderer, {
			editor,
			id,
			provider,
			binding,
			docMap: yjsDocMap,
			name,
			color,
			shouldBootstrap,
			cursorsContainerRef,
			initialEditorState,
			awarenessData,
			syncCursorPositionsFn
		});

		$$renderer.push(`<!----> `);
		YjsHistory($$renderer, { editor, binding });
		$$renderer.push(`<!----> `);
		YjsFocusTracking($$renderer, { editor, provider, name, color, awarenessData });
		$$renderer.push(`<!---->`);
	});
}
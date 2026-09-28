import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useCollaborationContext } from './CollaborationContext.js';
import { getEditor } from '../../composerContext.js';
import { createBinding } from '@lexical/yjs';
import { onMount } from 'svelte';
import YjsCollaboration from './YjsCollaboration.svelte';
import YjsHistory from './YjsHistory.svelte';
import YjsFocusTracking from './YjsFocusTracking.svelte';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function CollaborationPlugin($$anchor, $$props) {
	$.push($$props, true);

	const editor = getEditor();

	let id = $.prop($$props, 'id', 19, () => editor.getKey()),
		username = $.prop($$props, 'username', 3, undefined),
		cursorColor = $.prop($$props, 'cursorColor', 3, undefined),
		cursorsContainerRef = $.prop($$props, 'cursorsContainerRef', 3, null),
		initialEditorState = $.prop($$props, 'initialEditorState', 3, null),
		excludedProperties = $.prop($$props, 'excludedProperties', 3, undefined),
		awarenessData = $.prop($$props, 'awarenessData', 3, undefined),
		syncCursorPositionsFn = $.prop($$props, 'syncCursorPositionsFn', 3, undefined);

	const collabContext = useCollaborationContext(username(), cursorColor());
	const { yjsDocMap, name, color } = collabContext;
	const provider = $$props.providerFactory(id(), yjsDocMap);
	const doc = yjsDocMap.get(id());
	const binding = createBinding(editor, provider, id(), doc, yjsDocMap, excludedProperties());

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

	var fragment = root();
	var node = $.first_child(fragment);

	YjsCollaboration(node, {
		get editor() {
			return editor;
		},

		get id() {
			return id();
		},

		get provider() {
			return provider;
		},

		get binding() {
			return binding;
		},

		get docMap() {
			return yjsDocMap;
		},

		get name() {
			return name;
		},

		get color() {
			return color;
		},

		get shouldBootstrap() {
			return $$props.shouldBootstrap;
		},

		get cursorsContainerRef() {
			return cursorsContainerRef();
		},

		get initialEditorState() {
			return initialEditorState();
		},

		get awarenessData() {
			return awarenessData();
		},

		get syncCursorPositionsFn() {
			return syncCursorPositionsFn();
		}
	});

	var node_1 = $.sibling(node, 2);

	YjsHistory(node_1, {
		get editor() {
			return editor;
		},

		get binding() {
			return binding;
		}
	});

	var node_2 = $.sibling(node_1, 2);

	YjsFocusTracking(node_2, {
		get editor() {
			return editor;
		},

		get provider() {
			return provider;
		},

		get name() {
			return name;
		},

		get color() {
			return color;
		},

		get awarenessData() {
			return awarenessData();
		}
	});

	$.append($$anchor, fragment);
	$.pop();
}
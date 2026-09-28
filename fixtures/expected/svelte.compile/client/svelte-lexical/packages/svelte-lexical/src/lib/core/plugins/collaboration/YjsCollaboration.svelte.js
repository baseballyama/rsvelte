import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { mergeRegister } from '@lexical/utils';

import {
	CONNECTED_COMMAND,
	initLocalState,
	syncCursorPositions,
	syncLexicalUpdateToYjs,
	syncYjsChangesToLexical,
	TOGGLE_CONNECT_COMMAND
} from '@lexical/yjs';

import {
	$createParagraphNode as createParagraphNode,
	$getRoot as getRoot,
	$getSelection as getSelection,
	COMMAND_PRIORITY_EDITOR,
	HISTORY_MERGE_TAG,
	SKIP_COLLAB_TAG
} from 'lexical';

import { UndoManager } from 'yjs';
import { onMount } from 'svelte';

export default function YjsCollaboration($$anchor, $$props) {
	$.push($$props, true);

	let binding = $.prop($$props, 'binding', 15),
		cursorsContainerRef = $.prop($$props, 'cursorsContainerRef', 3, null),
		initialEditorState = $.prop($$props, 'initialEditorState', 3, null),
		awarenessData = $.prop($$props, 'awarenessData', 3, undefined),
		syncCursorPositionsFn = $.prop($$props, 'syncCursorPositionsFn', 3, syncCursorPositions);

	let isReloadingDoc = false;

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	let doc = $$props.docMap.get($$props.id);

	//const binding = createBinding(editor, provider, id, doc, docMap);
	const connect = () => {
		return $$props.provider.connect();
	};

	const disconnect = () => {
		try {
			$$props.provider.disconnect();
		} catch {
			// Do nothing
		}
	};

	function initializeProviderAndConnect() {
		const { root } = binding();
		const { awareness } = $$props.provider;

		const onStatus = ({ status }) => {
			$$props.editor.dispatchCommand(CONNECTED_COMMAND, status === 'connected');
		};

		const onSync = (isSynced) => {
			if ($$props.shouldBootstrap && isSynced && root.isEmpty() && root._xmlText._length === 0 && isReloadingDoc === false) {
				initializeEditor($$props.editor, initialEditorState());
			}

			isReloadingDoc = false;
		};

		const onAwarenessUpdate = () => {
			syncCursorPositionsFn()(binding(), $$props.provider);
		};

		const onYjsTreeChanges = (
			// The below `any` type is taken directly from the vendor types for YJS.
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			events,
			transaction
		) => {
			const origin = transaction.origin;

			if (origin !== binding()) {
				const isFromUndoManger = origin instanceof UndoManager;

				syncYjsChangesToLexical(binding(), $$props.provider, events, isFromUndoManger, syncCursorPositionsFn());
			}
		};

		initLocalState($$props.provider, $$props.name, $$props.color, document.activeElement === $$props.editor.getRootElement(), awarenessData() || {});

		const onProviderDocReload = (ydoc) => {
			clearEditorSkipCollab($$props.editor, binding());
			doc = ydoc;
			$$props.docMap.set($$props.id, ydoc);
			isReloadingDoc = true;
		};

		$$props.provider.on('reload', onProviderDocReload);
		$$props.provider.on('status', onStatus);
		$$props.provider.on('sync', onSync);
		awareness.on('update', onAwarenessUpdate);

		// This updates the local editor state when we receive updates from other clients
		root.getSharedType().observeDeep(onYjsTreeChanges);

		const removeListener = $$props.editor.registerUpdateListener((
			{
				prevEditorState,
				editorState,
				dirtyLeaves,
				dirtyElements,
				normalizedNodes,
				tags
			}
		) => {
			if (tags.has(SKIP_COLLAB_TAG) === false) {
				syncLexicalUpdateToYjs(binding(), $$props.provider, prevEditorState, editorState, dirtyElements, dirtyLeaves, normalizedNodes, tags);
			}
		});

		const connectionPromise = connect();

		return () => {
			if (isReloadingDoc === false) {
				if (connectionPromise) {
					connectionPromise.then(disconnect);
				} else {
					// Workaround for race condition in StrictMode. It's possible there
					// is a different race for the above case where connect returns a
					// promise, but we don't have an example of that in-repo.
					// It's possible that there is a similar issue with
					// TOGGLE_CONNECT_COMMAND below when the provider connect returns a
					// promise.
					// https://github.com/facebook/lexical/issues/6640
					disconnect();
				}
			}

			$$props.provider.off('sync', onSync);
			$$props.provider.off('status', onStatus);
			$$props.provider.off('reload', onProviderDocReload);
			awareness.off('update', onAwarenessUpdate);
			root.getSharedType().unobserveDeep(onYjsTreeChanges);
			$$props.docMap.delete($$props.id);
			removeListener();
		};
	}

	function createCursorsContainer() {
		const ref = document.createElement('div');
		const target = cursorsContainerRef() || document.body;

		target.appendChild(ref);
		binding(binding().cursorsContainer = ref, true);

		return () => {
			if (ref?.parentNode) {
				ref.parentNode?.removeChild(ref);
			}
		};
	}

	onMount(() => {
		return mergeRegister(createCursorsContainer(), initializeProviderAndConnect(), $$props.editor.registerCommand(
			TOGGLE_CONNECT_COMMAND,
			(payload) => {
				const shouldConnect = payload;

				if (shouldConnect) {
					// eslint-disable-next-line no-console
					console.log('Collaboration connected!');

					connect();
				} else {
					// eslint-disable-next-line no-console
					console.log('Collaboration disconnected!');

					disconnect();
				}

				return true;
			},
			COMMAND_PRIORITY_EDITOR
		));
	});

	function initializeEditor(editor, initialEditorState) {
		editor.update(
			() => {
				const root = getRoot();

				if (root.isEmpty()) {
					if (initialEditorState) {
						switch (typeof initialEditorState) {
							case 'string':
								{
									const parsedEditorState = editor.parseEditorState(initialEditorState);

									editor.setEditorState(parsedEditorState, { tag: HISTORY_MERGE_TAG });

									break;
								}

							case 'object':
								{
									editor.setEditorState(initialEditorState, { tag: HISTORY_MERGE_TAG });

									break;
								}

							case 'function':
								{
									editor.update(
										() => {
											const root1 = getRoot();

											if (root1.isEmpty()) {
												initialEditorState(editor);
											}
										},
										{ tag: HISTORY_MERGE_TAG }
									);

									break;
								}
						}
					} else {
						const paragraph = createParagraphNode();

						root.append(paragraph);

						const { activeElement } = document;

						if (getSelection() !== null || activeElement !== null && activeElement === editor.getRootElement()) {
							paragraph.select();
						}
					}
				}
			},
			{ tag: HISTORY_MERGE_TAG }
		);
	}

	function clearEditorSkipCollab(editor, binding) {
		// reset editor state
		editor.update(
			() => {
				const root = getRoot();

				root.clear();
				root.select();
			},
			{ tag: SKIP_COLLAB_TAG }
		);

		if (binding.cursors == null) {
			return;
		}

		const cursors = binding.cursors;

		if (cursors == null) {
			return;
		}

		const cursorsContainer = binding.cursorsContainer;

		if (cursorsContainer == null) {
			return;
		}

		// reset cursors in dom
		const cursorsArr = Array.from(cursors.values());

		for (let i = 0; i < cursorsArr.length; i++) {
			const cursor = cursorsArr[i];
			const selection = cursor.selection;

			if (selection && selection.selections != null) {
				const selections = selection.selections;

				for (let j = 0; j < selections.length; j++) {
					cursorsContainer.removeChild(selections[i]);
				}
			}
		}
	}

	$.pop();
}
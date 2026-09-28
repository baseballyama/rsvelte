import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CollaborationPlugin from '../collaboration/CollaborationPlugin.svelte';
import { setImageHistoryPluginType } from '../../composerContext.js';

export default function CaptionEditorCollaborationPlugin($$anchor, $$props) {
	$.push($$props, true);

	setImageHistoryPluginType({
		componentType: CollaborationPlugin,
		props: {
			providerFactory: $$props.providerFactory,
			shouldBootstrap: true
		}
	});

	$.pop();
}
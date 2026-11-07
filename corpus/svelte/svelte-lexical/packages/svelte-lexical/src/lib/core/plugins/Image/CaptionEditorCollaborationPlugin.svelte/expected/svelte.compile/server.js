import * as $ from 'svelte/internal/server';
import CollaborationPlugin from '../collaboration/CollaborationPlugin.svelte';
import { setImageHistoryPluginType } from '../../composerContext.js';

export default function CaptionEditorCollaborationPlugin($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { providerFactory } = $$props;

		setImageHistoryPluginType({
			componentType: CollaborationPlugin,
			props: { providerFactory, shouldBootstrap: true }
		});
	});
}
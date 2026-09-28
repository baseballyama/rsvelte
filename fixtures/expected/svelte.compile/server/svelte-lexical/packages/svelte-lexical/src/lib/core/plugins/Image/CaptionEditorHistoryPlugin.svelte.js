import * as $ from 'svelte/internal/server';
import { setImageHistoryPluginType } from '../../composerContext.js';
import SharedHistoryPlugin from '../SharedHistoryPlugin.svelte';

export default function CaptionEditorHistoryPlugin($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		setImageHistoryPluginType({ componentType: SharedHistoryPlugin });
	});
}
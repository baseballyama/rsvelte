import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setImageHistoryPluginType } from '../../composerContext.js';
import SharedHistoryPlugin from '../SharedHistoryPlugin.svelte';

export default function CaptionEditorHistoryPlugin($$anchor, $$props) {
	$.push($$props, true);
	setImageHistoryPluginType({ componentType: SharedHistoryPlugin });
	$.pop();
}
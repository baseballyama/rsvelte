import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import './TreeView.css';
import TreeView from './TreeView.svelte';

export default function TreeViewPlugin($$anchor) {
	TreeView($$anchor, {
		viewClassName: 'tree-view-output',
		treeTypeButtonClassName: 'debug-treetype-button',
		timeTravelPanelClassName: 'debug-timetravel-panel',
		timeTravelButtonClassName: 'debug-timetravel-button',
		timeTravelPanelSliderClassName: 'debug-timetravel-panel-slider',
		timeTravelPanelButtonClassName: 'debug-timetravel-panel-button'
	});
}
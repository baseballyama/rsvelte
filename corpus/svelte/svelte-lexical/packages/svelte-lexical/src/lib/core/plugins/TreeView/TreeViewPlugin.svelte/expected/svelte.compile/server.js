import * as $ from 'svelte/internal/server';
import './TreeView.css';
import TreeView from './TreeView.svelte';

export default function TreeViewPlugin($$renderer) {
	TreeView($$renderer, {
		viewClassName: 'tree-view-output',
		treeTypeButtonClassName: 'debug-treetype-button',
		timeTravelPanelClassName: 'debug-timetravel-panel',
		timeTravelButtonClassName: 'debug-timetravel-button',
		timeTravelPanelSliderClassName: 'debug-timetravel-panel-slider',
		timeTravelPanelButtonClassName: 'debug-timetravel-panel-button'
	});
}
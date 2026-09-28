import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ChartChildrenBase from './ChartChildren.base.svelte';
import Layer from '../layers/Layer.svelte';
import Axis from '../Axis/Axis.svelte';
import Grid from '../Grid/Grid.svelte';
import Rule from '../Rule/Rule.svelte';
import Highlight from '../Highlight/Highlight.svelte';
import ChartClipPath from '../ChartClipPath/ChartClipPath.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function ChartChildren($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);

	ChartChildrenBase($$anchor, $.spread_props(
		{
			get Layer() {
				return Layer;
			},

			get Axis() {
				return Axis;
			},

			get Grid() {
				return Grid;
			},

			get Rule() {
				return Rule;
			},

			get Highlight() {
				return Highlight;
			},

			get ChartClipPath() {
				return ChartClipPath;
			}
		},
		() => props
	));
}
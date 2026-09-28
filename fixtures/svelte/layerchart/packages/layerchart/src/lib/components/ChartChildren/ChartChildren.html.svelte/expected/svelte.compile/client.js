import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ChartChildrenBase from './ChartChildren.base.svelte';
import Layer from '../layers/Html.svelte';
import Axis from '../Axis/Axis.html.svelte';
import Grid from '../Grid/Grid.html.svelte';
import Rule from '../Rule/Rule.html.svelte';
import Highlight from '../Highlight/Highlight.html.svelte';
import ChartClipPath from '../ChartClipPath/ChartClipPath.html.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function ChartChildren_html($$anchor, $$props) {
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
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import BrushBase from './Brush.base.svelte';
import Rect from '../Rect/Rect.canvas.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'state']);

export default function Brush_canvas($$anchor, $$props) {
	$.push($$props, true);

	let stateProp = $.prop($$props, 'state', 15),
		rest = $.rest_props($$props, rest_excludes);

	BrushBase($$anchor, $.spread_props(
		{
			get Rect() {
				return Rect;
			}
		},
		() => rest,
		{
			get state() {
				return stateProp();
			},

			set state($$value) {
				stateProp($$value);
			}
		}
	));

	$.pop();
}
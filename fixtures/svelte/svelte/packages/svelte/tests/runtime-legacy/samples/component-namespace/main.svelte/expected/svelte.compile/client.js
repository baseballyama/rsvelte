import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Widget } from './Widget.svelte';

export default function Main($$anchor) {
	let widgets = [Widget];
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => widgets, $.index, ($$anchor, LazyWidget) => {
		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		$.component(node_1, () => $.get(LazyWidget).Tooltip, ($$anchor, LazyWidget_Tooltip) => {
			LazyWidget_Tooltip($$anchor, {});
		});

		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
}
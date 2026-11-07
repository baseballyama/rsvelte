import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '@threlte/core';
import { VRButton } from '@threlte/xr';
import Scene from './Scene.svelte';

var root = $.from_html(`<div class="example svelte-1glilhy"><div class="hud svelte-1glilhy">Best tested in VR: walk around your playspace, then click a colored pad. The cyan feet marker
    should land in the middle of the selected pad.</div> <!> <!></div>`);

export default function App($$anchor) {
	var div = root();
	var node = $.sibling($.child(div), 2);

	Canvas(node, {
		children: ($$anchor, $$slotProps) => {
			Scene($$anchor, {});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	VRButton(node_1, {});
	$.reset(div);
	$.append($$anchor, div);
}
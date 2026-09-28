import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import AdditionalStyling from "./components/sections/additional-styling.svelte";
import AnimatingIcons from "./components/sections/animating-icons.svelte";
import BasicUse from "./components/sections/basic-use.svelte";
import DuotoneIcons from "./components/sections/duotone-icons.svelte";
import Installation from "./components/sections/installation.svelte";
import LayeringAndText from "./components/sections/layering-and-text.svelte";
import PowerTransforms from "./components/sections/power-transforms.svelte";

var root = $.from_html(`<div><!> <!> <!> <!> <!> <!> <!></div>`);

export default function Docs($$anchor) {
	var div = root();
	var node = $.child(div);

	Installation(node, {});

	var node_1 = $.sibling(node, 2);

	BasicUse(node_1, {});

	var node_2 = $.sibling(node_1, 2);

	AdditionalStyling(node_2, {});

	var node_3 = $.sibling(node_2, 2);

	AnimatingIcons(node_3, {});

	var node_4 = $.sibling(node_3, 2);

	PowerTransforms(node_4, {});

	var node_5 = $.sibling(node_4, 2);

	LayeringAndText(node_5, {});

	var node_6 = $.sibling(node_5, 2);

	DuotoneIcons(node_6, {});
	$.reset(div);
	$.append($$anchor, div);
}
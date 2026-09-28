import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Fa from "$lib/fa.svelte";
import { faSeedling } from "@fortawesome/free-solid-svg-icons";
import DocsCode from "../ui/docs-code.svelte";
import DocsTitle from "../ui/docs-title.svelte";
import codes from "./codes.js";

var root = $.from_html(`<!> <!> <div class="shadow-sm p-3 mb-3 rounded"><!> <!> <!></div> <!> <!> <div class="shadow-sm p-3 mb-3 rounded"><!> <!> <!> <!> <!></div> <!> <!> <div class="shadow-sm p-3 mb-3 rounded"><!> <!> <!> <!> <!> <!> <!> <!> <!></div> <!>`, 1);

export default function Power_transforms($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var node = $.first_child(fragment);

	DocsTitle(node, { title: 'Power Transforms' });

	var node_1 = $.sibling(node, 2);

	DocsTitle(node_1, { title: 'Scaling', level: 3 });

	var div = $.sibling(node_1, 2);
	var node_2 = $.child(div);

	Fa(node_2, {
		get icon() {
			return faSeedling;
		},
		size: '4x',
		style: 'background: mistyrose'
	});

	var node_3 = $.sibling(node_2, 2);

	Fa(node_3, {
		get icon() {
			return faSeedling;
		},
		scale: 0.5,
		size: '4x',
		style: 'background: mistyrose'
	});

	var node_4 = $.sibling(node_3, 2);

	Fa(node_4, {
		get icon() {
			return faSeedling;
		},
		scale: 1.2,
		size: '4x',
		style: 'background: mistyrose'
	});

	$.reset(div);

	var node_5 = $.sibling(div, 2);

	DocsCode(node_5, {
		get code() {
			return codes.powerTransforms[0];
		}
	});

	var node_6 = $.sibling(node_5, 2);

	DocsTitle(node_6, { title: 'Positioning', level: 3 });

	var div_1 = $.sibling(node_6, 2);
	var node_7 = $.child(div_1);

	Fa(node_7, {
		get icon() {
			return faSeedling;
		},
		scale: 0.5,
		size: '4x',
		style: 'background: mistyrose'
	});

	var node_8 = $.sibling(node_7, 2);

	Fa(node_8, {
		get icon() {
			return faSeedling;
		},
		scale: 0.5,
		translateX: 0.2,
		size: '4x',
		style: 'background: mistyrose'
	});

	var node_9 = $.sibling(node_8, 2);

	Fa(node_9, {
		get icon() {
			return faSeedling;
		},
		scale: 0.5,
		translateX: -0.2,
		size: '4x',
		style: 'background: mistyrose'
	});

	var node_10 = $.sibling(node_9, 2);

	Fa(node_10, {
		get icon() {
			return faSeedling;
		},
		scale: 0.5,
		translateY: 0.2,
		size: '4x',
		style: 'background: mistyrose'
	});

	var node_11 = $.sibling(node_10, 2);

	Fa(node_11, {
		get icon() {
			return faSeedling;
		},
		scale: 0.5,
		translateY: -0.2,
		size: '4x',
		style: 'background: mistyrose'
	});

	$.reset(div_1);

	var node_12 = $.sibling(div_1, 2);

	DocsCode(node_12, {
		get code() {
			return codes.powerTransforms[1];
		}
	});

	var node_13 = $.sibling(node_12, 2);

	DocsTitle(node_13, { title: 'Rotating & Flipping', level: 3 });

	var div_2 = $.sibling(node_13, 2);
	var node_14 = $.child(div_2);

	Fa(node_14, {
		get icon() {
			return faSeedling;
		},
		rotate: 90,
		size: '4x',
		style: 'background: mistyrose'
	});

	var node_15 = $.sibling(node_14, 2);

	Fa(node_15, {
		get icon() {
			return faSeedling;
		},
		rotate: 180,
		size: '4x',
		style: 'background: mistyrose'
	});

	var node_16 = $.sibling(node_15, 2);

	Fa(node_16, {
		get icon() {
			return faSeedling;
		},
		size: '4x',
		rotate: '270',
		style: 'background: mistyrose'
	});

	var node_17 = $.sibling(node_16, 2);

	Fa(node_17, {
		get icon() {
			return faSeedling;
		},
		size: '4x',
		rotate: '30',
		style: 'background: mistyrose'
	});

	var node_18 = $.sibling(node_17, 2);

	Fa(node_18, {
		get icon() {
			return faSeedling;
		},
		size: '4x',
		rotate: '-30',
		style: 'background: mistyrose'
	});

	var node_19 = $.sibling(node_18, 2);

	Fa(node_19, {
		get icon() {
			return faSeedling;
		},
		size: '4x',
		flip: 'vertical',
		style: 'background: mistyrose'
	});

	var node_20 = $.sibling(node_19, 2);

	Fa(node_20, {
		get icon() {
			return faSeedling;
		},
		size: '4x',
		flip: 'horizontal',
		style: 'background: mistyrose'
	});

	var node_21 = $.sibling(node_20, 2);

	Fa(node_21, {
		get icon() {
			return faSeedling;
		},
		size: '4x',
		flip: 'both',
		style: 'background: mistyrose'
	});

	var node_22 = $.sibling(node_21, 2);

	Fa(node_22, {
		get icon() {
			return faSeedling;
		},
		size: '4x',
		flip: 'both',
		rotate: '30',
		style: 'background: mistyrose'
	});

	$.reset(div_2);

	var node_23 = $.sibling(div_2, 2);

	DocsCode(node_23, {
		get code() {
			return codes.powerTransforms[2];
		}
	});

	$.append($$anchor, fragment);
	$.pop();
}
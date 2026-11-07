import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Fa from "$lib/fa.svelte";
import FaLayers from "$lib/fa-layers.svelte";
import FaLayersText from "$lib/fa-layers-text.svelte";

import {
	faBookmark,
	faCalendar,
	faCertificate,
	faCircle,
	faEnvelope,
	faHeart,
	faMoon,
	faPlay,
	faStar,
	faSun,
	faTimes
} from "@fortawesome/free-solid-svg-icons";

import DocsCode from "../ui/docs-code.svelte";
import DocsTitle from "../ui/docs-title.svelte";
import codes from "./codes.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <div class="shadow-sm p-3 mb-3 rounded"><!> <!> <!> <!> <!> <!></div> <!> <!>`, 1);

export default function Layering_and_text($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root_2();
	var node = $.first_child(fragment);

	DocsTitle(node, { title: 'Layering & Text' });

	var div = $.sibling(node, 2);
	var node_1 = $.child(div);

	FaLayers(node_1, {
		size: '4x',
		style: 'background: mistyrose',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_2 = $.first_child(fragment_1);

			Fa(node_2, {
				get icon() {
					return faCircle;
				},
				color: 'tomato'
			});

			var node_3 = $.sibling(node_2, 2);

			Fa(node_3, {
				get icon() {
					return faTimes;
				},
				scale: 0.5,
				color: 'white'
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_1, 2);

	FaLayers(node_4, {
		size: '4x',
		style: 'background: mistyrose',
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root();
			var node_5 = $.first_child(fragment_2);

			Fa(node_5, {
				get icon() {
					return faBookmark;
				}
			});

			var node_6 = $.sibling(node_5, 2);

			Fa(node_6, {
				get icon() {
					return faHeart;
				},
				scale: 0.4,
				translateY: -0.1,
				color: 'tomato'
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_4, 2);

	FaLayers(node_7, {
		size: '4x',
		style: 'background: mistyrose',
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root_1();
			var node_8 = $.first_child(fragment_3);

			Fa(node_8, {
				get icon() {
					return faPlay;
				},
				scale: 1.2,
				rotate: -90
			});

			var node_9 = $.sibling(node_8, 2);

			Fa(node_9, {
				get icon() {
					return faSun;
				},
				scale: 0.35,
				translateY: -0.2,
				color: 'white'
			});

			var node_10 = $.sibling(node_9, 2);

			Fa(node_10, {
				get icon() {
					return faMoon;
				},
				scale: 0.3,
				translateX: -0.25,
				translateY: 0.25,
				color: 'white'
			});

			var node_11 = $.sibling(node_10, 2);

			Fa(node_11, {
				get icon() {
					return faStar;
				},
				scale: 0.3,
				translateX: 0.25,
				translateY: 0.25,
				color: 'white'
			});

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	var node_12 = $.sibling(node_7, 2);

	FaLayers(node_12, {
		size: '4x',
		style: 'background: mistyrose',
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = root();
			var node_13 = $.first_child(fragment_4);

			Fa(node_13, {
				get icon() {
					return faCalendar;
				}
			});

			var node_14 = $.sibling(node_13, 2);

			FaLayersText(node_14, {
				scale: 0.45,
				translateY: 0.1,
				color: 'white',
				style: 'font-weight: 900',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('27');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	var node_15 = $.sibling(node_12, 2);

	FaLayers(node_15, {
		size: '4x',
		style: 'background: mistyrose',
		children: ($$anchor, $$slotProps) => {
			var fragment_5 = root();
			var node_16 = $.first_child(fragment_5);

			Fa(node_16, {
				get icon() {
					return faCertificate;
				}
			});

			var node_17 = $.sibling(node_16, 2);

			FaLayersText(node_17, {
				scale: 0.25,
				rotate: -30,
				color: 'white',
				style: 'font-weight: 900',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('NEW');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});

	var node_18 = $.sibling(node_15, 2);

	FaLayers(node_18, {
		size: '4x',
		style: 'background: mistyrose',
		children: ($$anchor, $$slotProps) => {
			var fragment_6 = root();
			var node_19 = $.first_child(fragment_6);

			Fa(node_19, {
				get icon() {
					return faEnvelope;
				}
			});

			var node_20 = $.sibling(node_19, 2);

			FaLayersText(node_20, {
				scale: 0.2,
				translateX: 0.4,
				translateY: -0.4,
				color: 'white',
				style: 'padding: 0 .2em; background: tomato; border-radius: 1em',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('1,419');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_6);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var node_21 = $.sibling(div, 2);

	DocsCode(node_21, {
		get code() {
			return codes.layering[0];
		},
		lang: 'js'
	});

	var node_22 = $.sibling(node_21, 2);

	DocsCode(node_22, {
		get code() {
			return codes.layering[1];
		}
	});

	$.append($$anchor, fragment);
	$.pop();
}
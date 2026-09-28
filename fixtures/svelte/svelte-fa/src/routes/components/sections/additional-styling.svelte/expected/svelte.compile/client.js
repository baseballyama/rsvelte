import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Fa from "$lib/fa.svelte";

import {
	faBook,
	faCog,
	faFlag,
	faHome,
	faInfo,
	faPencilAlt,
	faQuoteLeft,
	faQuoteRight
} from "@fortawesome/free-solid-svg-icons";

import DocsCode from "../ui/docs-code.svelte";
import DocsTitle from "../ui/docs-title.svelte";
import codes from "./codes.js";

var root = $.from_html(
	`<!> <!> <div class="shadow-sm p-3 mb-3 rounded"><!> <!> <!> <!> <!> <!> <!> <!></div> <!> <!> <div class="shadow-sm p-3 mb-3 rounded"><div><!> Home</div> <div><!> Info</div> <div><!> Library</div> <div><!> Applications</div> <div><!> Settings</div></div> <!> <!> <div class="shadow-sm p-3 mb-3 rounded"><!> <!> Gatsby believed in the green light, the orgastic future that year by year recedes before us. It eluded
  us then, but that’s no matter — tomorrow we will run faster, stretch our arms further... And one fine
  morning — So we beat on, boats against the current, borne back ceaselessly into the past.</div> <!>`,
	1
);

export default function Additional_styling($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var node = $.first_child(fragment);

	DocsTitle(node, { title: 'Additional Styling' });

	var node_1 = $.sibling(node, 2);

	DocsTitle(node_1, { title: 'Icon Sizes', level: 3 });

	var div = $.sibling(node_1, 2);
	var node_2 = $.child(div);

	Fa(node_2, {
		get icon() {
			return faFlag;
		},
		size: 'xs'
	});

	var node_3 = $.sibling(node_2, 2);

	Fa(node_3, {
		get icon() {
			return faFlag;
		},
		size: 'sm'
	});

	var node_4 = $.sibling(node_3, 2);

	Fa(node_4, {
		get icon() {
			return faFlag;
		},
		size: 'lg'
	});

	var node_5 = $.sibling(node_4, 2);

	Fa(node_5, {
		get icon() {
			return faFlag;
		},
		size: '2x'
	});

	var node_6 = $.sibling(node_5, 2);

	Fa(node_6, {
		get icon() {
			return faFlag;
		},
		size: '2.5x'
	});

	var node_7 = $.sibling(node_6, 2);

	Fa(node_7, {
		get icon() {
			return faFlag;
		},
		size: '5x'
	});

	var node_8 = $.sibling(node_7, 2);

	Fa(node_8, {
		get icon() {
			return faFlag;
		},
		size: '7x'
	});

	var node_9 = $.sibling(node_8, 2);

	Fa(node_9, {
		get icon() {
			return faFlag;
		},
		size: '10x'
	});

	$.reset(div);

	var node_10 = $.sibling(div, 2);

	DocsCode(node_10, {
		get code() {
			return codes.additionalStyling[0];
		}
	});

	var node_11 = $.sibling(node_10, 2);

	DocsTitle(node_11, { title: 'Fixed Width Icons', level: 3 });

	var div_1 = $.sibling(node_11, 2);
	var div_2 = $.child(div_1);
	var node_12 = $.child(div_2);

	Fa(node_12, {
		get icon() {
			return faHome;
		},
		fw: true,
		style: 'background: mistyrose'
	});

	$.next();
	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_13 = $.child(div_3);

	Fa(node_13, {
		get icon() {
			return faInfo;
		},
		fw: true,
		style: 'background: mistyrose'
	});

	$.next();
	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_14 = $.child(div_4);

	Fa(node_14, {
		get icon() {
			return faBook;
		},
		fw: true,
		style: 'background: mistyrose'
	});

	$.next();
	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node_15 = $.child(div_5);

	Fa(node_15, {
		get icon() {
			return faPencilAlt;
		},
		fw: true,
		style: 'background: mistyrose'
	});

	$.next();
	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var node_16 = $.child(div_6);

	Fa(node_16, {
		get icon() {
			return faCog;
		},
		fw: true,
		style: 'background: mistyrose'
	});

	$.next();
	$.reset(div_6);
	$.reset(div_1);

	var node_17 = $.sibling(div_1, 2);

	DocsCode(node_17, {
		get code() {
			return codes.additionalStyling[1];
		}
	});

	var node_18 = $.sibling(node_17, 2);

	DocsTitle(node_18, { title: 'Pulled Icons', level: 3 });

	var div_7 = $.sibling(node_18, 2);
	var node_19 = $.child(div_7);

	Fa(node_19, {
		get icon() {
			return faQuoteLeft;
		},
		pull: 'left',
		size: '2x'
	});

	var node_20 = $.sibling(node_19, 2);

	Fa(node_20, {
		get icon() {
			return faQuoteRight;
		},
		pull: 'right',
		size: '2x'
	});

	$.next();
	$.reset(div_7);

	var node_21 = $.sibling(div_7, 2);

	DocsCode(node_21, {
		get code() {
			return codes.additionalStyling[2];
		}
	});

	$.append($$anchor, fragment);
	$.pop();
}
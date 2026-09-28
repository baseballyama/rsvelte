import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DocsCode from "../ui/docs-code.svelte";
import DocsImg from "../ui/docs-img.svelte";
import DocsTitle from "../ui/docs-title.svelte";
import codes from "./codes.js";

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Duotone_icons($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var node = $.first_child(fragment);

	DocsTitle(node, { title: 'Duotone Icons' });

	var node_1 = $.sibling(node, 2);

	DocsTitle(node_1, { title: 'Basic Use', level: 3 });

	var node_2 = $.sibling(node_1, 2);

	DocsImg(node_2, { src: 'assets/duotone-0.png', alt: 'duotone icons basic use' });

	var node_3 = $.sibling(node_2, 2);

	DocsCode(node_3, {
		get code() {
			return codes.duotoneIcons[0];
		},
		lang: 'js'
	});

	var node_4 = $.sibling(node_3, 2);

	DocsCode(node_4, {
		get code() {
			return codes.duotoneIcons[1];
		}
	});

	var node_5 = $.sibling(node_4, 2);

	DocsTitle(node_5, { title: 'Swapping Layer Opacity', level: 3 });

	var node_6 = $.sibling(node_5, 2);

	DocsImg(node_6, {
		src: 'assets/duotone-1.png',
		alt: 'swapping duotone icons layer opacity'
	});

	var node_7 = $.sibling(node_6, 2);

	DocsCode(node_7, {
		get code() {
			return codes.duotoneIcons[2];
		}
	});

	var node_8 = $.sibling(node_7, 2);

	DocsTitle(node_8, { title: 'Changing Opacity', level: 3 });

	var node_9 = $.sibling(node_8, 2);

	DocsImg(node_9, {
		src: 'assets/duotone-2.png',
		alt: 'changing duotone icons opacity'
	});

	var node_10 = $.sibling(node_9, 2);

	DocsCode(node_10, {
		get code() {
			return codes.duotoneIcons[3];
		}
	});

	var node_11 = $.sibling(node_10, 2);

	DocsImg(node_11, {
		src: 'assets/duotone-3.png',
		alt: 'changing duotone icons opacity'
	});

	var node_12 = $.sibling(node_11, 2);

	DocsCode(node_12, {
		get code() {
			return codes.duotoneIcons[4];
		}
	});

	var node_13 = $.sibling(node_12, 2);

	DocsTitle(node_13, { title: 'Coloring Duotone Icons', level: 3 });

	var node_14 = $.sibling(node_13, 2);

	DocsImg(node_14, { src: 'assets/duotone-4.png', alt: 'coloring duotone icons' });

	var node_15 = $.sibling(node_14, 2);

	DocsCode(node_15, {
		get code() {
			return codes.duotoneIcons[5];
		}
	});

	var node_16 = $.sibling(node_15, 2);

	DocsTitle(node_16, { title: 'Advanced Use', level: 3 });

	var node_17 = $.sibling(node_16, 2);

	DocsImg(node_17, {
		src: 'assets/duotone-5.png',
		alt: 'duotone icons advanced use'
	});

	var node_18 = $.sibling(node_17, 2);

	DocsCode(node_18, {
		get code() {
			return codes.duotoneIcons[6];
		}
	});

	var node_19 = $.sibling(node_18, 2);

	DocsImg(node_19, {
		src: 'assets/duotone-6.png',
		alt: 'duotone icons advanced use'
	});

	var node_20 = $.sibling(node_19, 2);

	DocsCode(node_20, {
		get code() {
			return codes.duotoneIcons[7];
		}
	});

	var node_21 = $.sibling(node_20, 2);

	DocsImg(node_21, {
		src: 'assets/duotone-7.png',
		alt: 'duotone icons advanced use'
	});

	var node_22 = $.sibling(node_21, 2);

	DocsCode(node_22, {
		get code() {
			return codes.duotoneIcons[8];
		},
		lang: 'js'
	});

	var node_23 = $.sibling(node_22, 2);

	DocsCode(node_23, {
		get code() {
			return codes.duotoneIcons[9];
		}
	});

	$.append($$anchor, fragment);
	$.pop();
}
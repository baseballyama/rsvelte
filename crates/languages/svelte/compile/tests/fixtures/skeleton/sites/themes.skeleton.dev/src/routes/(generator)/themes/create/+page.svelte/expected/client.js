import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Logo from '$lib/components/common/Logo/Logo.svelte';
import Controls from '$lib/components/generator/Controls/Controls.svelte';
import Preview from '$lib/components/generator/Preview/Preview.svelte';
import { generatePreviewCss } from '$lib/utils/generator/generate-css';
import { generateFontFaces } from '$lib/utils/generator/generate-font-faces';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="lg:hidden absolute top-0 z-50 left-0 w-full h-full bg-surface-50-950 flex justify-center items-center p-4"><div class="card bg-surface-100-900 max-w-96 p-10 space-y-5 shadow-xl"><!> <h2 class="h2">Not Available.</h2> <p class="opacity-60">The theme generator is not currently available for small screen devices. We recommend using either a tablet or desktop.</p></div></div> <main class="h-full grid grid-cols-[1fr_480px]"><!> <!></main>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment_1 = root_1();

	// Components (generator)
	// Utils
	$.head('1yrilx', ($$anchor) => {
		var fragment = root();
		var node = $.first_child(fragment);

		$.html(node, () => `<style>${generatePreviewCss()}</style>`);

		var node_1 = $.sibling(node, 2);

		$.html(node_1, () => `<style>${generateFontFaces()}</style>`);
		$.append($$anchor, fragment);
	});

	var div = $.first_child(fragment_1);
	var div_1 = $.child(div);
	var node_2 = $.child(div_1);

	Logo(node_2, {});
	$.next(4);
	$.reset(div_1);
	$.reset(div);

	var main = $.sibling(div, 2);
	var node_3 = $.child(main);

	Preview(node_3, {});

	var node_4 = $.sibling(node_3, 2);

	Controls(node_4, {});
	$.reset(main);
	$.append($$anchor, fragment_1);
	$.pop();
}
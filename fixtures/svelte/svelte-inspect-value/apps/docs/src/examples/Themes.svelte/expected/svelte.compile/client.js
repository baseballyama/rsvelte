import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fade } from 'svelte/transition';
import Generic from './Generic.svelte';

var root = $.from_html(`<div style="font-size: 0.8em"><b style="text-transform: capitalize;"> </b> <p> </p></div>`);
var root_1 = $.from_html(`<div class="themes-container not-content svelte-1v7ol0a"><button>&LeftArrow;</button> <div class="flex col" style="flex-basis: 100%"><!> <!></div> <button>&RightArrow;</button></div>`);

export default function Themes($$anchor) {
	const themes = {
		inspect: 'The default, original color scheme designed for this library',
		drak: 'Based on the famous dracula color scheme',
		stereo: 'Based on the great monokai color scheme',
		dark: `Because light hurts your eyes`,
		light: 'Is it bright in here?',
		plain: 'Uses the current font-color and color-mixing to create a dynamic color scheme'
	};

	const builtIns = Object.keys(themes);
	let currentIndex = $.state(0);
	let currentTheme = $.derived(() => builtIns[$.get(currentIndex)]);

	function setCurrentIndex(dir) {
		$.set(currentIndex, $.get(currentIndex) + dir);

		if ($.get(currentIndex) === -1) {
			$.set(currentIndex, builtIns.length - 1);
		} else if ($.get(currentIndex) === builtIns.length) {
			$.set(currentIndex, 0);
		}
	}

	var div = root_1();
	var button = $.child(div);
	var div_1 = $.sibling(button, 2);
	var node = $.child(div_1);

	Generic(node, {
		seeFlashing: true,
		style: 'width: 100%',
		get theme() {
			return $.get(currentTheme);
		},
		heading: false,
		search: false
	});

	var node_1 = $.sibling(node, 2);

	$.key(node_1, () => $.get(currentIndex), ($$anchor) => {
		var div_2 = root();
		var b = $.child(div_2);
		var text = $.only_child(b, true);
		var p = $.sibling(b, 2);
		var text_1 = $.only_child(p, true);

		$.reset(div_2);

		$.template_effect(() => {
			$.set_text(text, $.get(currentTheme));
			$.set_text(text_1, themes[$.get(currentTheme)]);
		});

		$.transition(1, div_2, () => fade);
		$.append($$anchor, div_2);
	});

	$.reset(div_1);

	var button_1 = $.sibling(div_1, 2);

	$.reset(div);
	$.delegated('click', button, () => setCurrentIndex(-1));
	$.delegated('click', button_1, () => setCurrentIndex(1));
	$.append($$anchor, div);
}

$.delegate(['click']);
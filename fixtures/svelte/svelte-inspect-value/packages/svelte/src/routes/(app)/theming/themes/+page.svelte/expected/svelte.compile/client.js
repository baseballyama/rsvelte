import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import AllTypes from '$doclib/examples/AllTypes.svelte';
import { createPageTitle } from '$doclib/util.js';
import { fade } from 'svelte/transition';

var root = $.from_html(`<div style="font-size: 0.8em"><b style="text-transform: capitalize;"> </b> <p> </p></div>`);

var root_1 = $.from_html(
	`<h1>Themes</h1> <div class="flex justify-center align-center"><button>&LeftArrow;</button> <div class="flex col" style="max-width: 480px"><!> <!></div> <button>&RightArrow;</button></div> <h2>Base16</h2> <p>Svelte Inspect Value utilizes the base16-framework for theming, meaning a theme can be defined
  with (less than) 16 colors.<br/> If you have favorite <a target="_blank" href="https://github.com/chriskempson/base16">base16</a> color-scheme it will probably work well with <code>Inspect</code>.<br/> The variables <code>--base04</code> and <code>--base0F</code> is currently not used by any default themes, but is still defined and can be used in <a href="/reference/custom">custom components.</a><br/></p> <h2>How To</h2> <p>Visit the <a href="/theming/define">theme creator</a> for an overview of how the base16-variables are
  applied and examples on how to define and use a custom theme.</p>`,
	1
);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

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

	var fragment = root_1();

	$.head('clveqt', ($$anchor) => {
		$.deferred_template_effect(
			($0) => {
				$.document.title = $0 ?? '';
			},
			[() => createPageTitle('Theming')]
		);
	});

	var div = $.sibling($.first_child(fragment), 2);
	var button = $.child(div);
	var div_1 = $.sibling(button, 2);
	var node = $.child(div_1);

	AllTypes(node, {
		seeFlashing: true,
		style: 'max-width: 480px;',
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
	$.next(8);
	$.delegated('click', button, () => setCurrentIndex(-1));
	$.delegated('click', button_1, () => setCurrentIndex(1));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);
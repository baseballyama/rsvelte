import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setContext } from 'svelte';
import RichTextComposer from './RichTextComposer.svelte';
import Settings from './settings/Settings.svelte';
import { createSettingsStore } from './settings/settingsStore';
import { ThemeSelector, ThemeImage } from 'svelte-lexical/dist/themes/system-light-dark/ui';

var root = $.from_html(`<main class="svelte-346k45"><div class="header-container svelte-346k45"><!></div> <!> <p>This is the <a href="https://github.com/umaranis/svelte-lexical/" class="svelte-346k45">svelte-lexical</a> <strong>playground.</strong></p> <p>It demonstrates most of the features of the library. It is also used for
    running end-to-end (e2e) tests.</p> <div style="text-align: left;"><!> <!></div></main>`);

export default function App($$anchor, $$props) {
	$.push($$props, true);

	const settings = createSettingsStore();

	setContext('settings', settings);

	var main = root();
	var div = $.child(main);
	var node = $.child(div);

	ThemeSelector(node, {});
	$.reset(div);

	var node_1 = $.sibling(div, 2);

	ThemeImage(node_1, {
		lightSrc: 'images/logo.svg',
		darkSrc: 'images/logo_white.svg',
		alt: 'Svelte Lexical!',
		style: 'margin: 2em; max-width: 800px;'
	});

	var div_1 = $.sibling(node_1, 6);
	var node_2 = $.child(div_1);

	RichTextComposer(node_2, {});

	var node_3 = $.sibling(node_2, 2);

	Settings(node_3, {});
	$.reset(div_1);
	$.reset(main);
	$.append($$anchor, main);
	$.pop();
}
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

const context = $.proxy({ settings: { showInRgb: true } });

export const settings = context.settings;

var root = $.from_html(`<button> </button> <!>`, 1);

export default function Main($$anchor) {
	var fragment = root();
	var button = $.first_child(fragment);
	var text = $.only_child(button);
	var node = $.sibling(button, 2);

	Child(node, {});
	$.template_effect(() => $.set_text(text, `click ${settings.showInRgb ?? ''}`));
	$.delegated('click', button, () => settings.showInRgb = !settings.showInRgb);
	$.append($$anchor, fragment);
}

$.delegate(['click']);
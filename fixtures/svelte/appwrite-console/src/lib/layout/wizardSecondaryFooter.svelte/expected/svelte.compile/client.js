import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="wizard-secondary-options"><div class="wizard-secondary-options-start"><!></div> <div class="wizard-secondary-options-end"><!></div></div>`);

export default function WizardSecondaryFooter($$anchor, $$props) {
	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	$.slot(node, $$props, 'start', {}, null);
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_1 = $.child(div_2);

	$.slot(node_1, $$props, 'default', {}, null);
	$.reset(div_2);
	$.reset(div);
	$.append($$anchor, div);
}
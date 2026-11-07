import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setup } from '../../../../setup.js';

export default function _layout($$anchor, $$props) {
	$.push($$props, true);
	setup();

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.slot(node, $$props, 'default', {}, null);
	$.append($$anchor, fragment);
	$.pop();
}
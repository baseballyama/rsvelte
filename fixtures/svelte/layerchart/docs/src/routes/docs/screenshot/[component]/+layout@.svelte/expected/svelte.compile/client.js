import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { examples } from '@layerstack/docs/context';

export default function _layout_($$anchor, $$props) {
	$.push($$props, true);

	// Add examples to context for Example component to use
	const examplesContext = {
		get current() {
			return $$props.data.examples;
		}
	};

	examples.set(examplesContext);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children);
	$.append($$anchor, fragment);
	$.pop();
}
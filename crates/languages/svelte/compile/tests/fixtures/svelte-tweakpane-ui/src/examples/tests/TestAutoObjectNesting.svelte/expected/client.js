import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AutoObject } from '$lib';

var root = $.from_html(`<!> <pre>Value: <span> </span></pre>`, 1);

export default function TestAutoObjectNesting($$anchor) {
	// https://github.com/kitschpatrol/svelte-tweakpane-ui/issues/10
	let object = {
		aFolder: {
			aSetting: 0,
			bFolder: { bSetting: 0, cFolder: { cSetting: 0 } }
		}
	};

	var fragment = root();
	var node = $.first_child(fragment);

	AutoObject(node, {
		get object() {
			return object;
		},

		set object($$value) {
			object = $$value;
		}
	});

	var pre = $.sibling(node, 2);
	var span = $.sibling($.child(pre));
	var text = $.only_child(span, true);

	$.reset(pre);
	$.template_effect(($0) => $.set_text(text, $0), [() => JSON.stringify(object)]);
	$.append($$anchor, fragment);
}
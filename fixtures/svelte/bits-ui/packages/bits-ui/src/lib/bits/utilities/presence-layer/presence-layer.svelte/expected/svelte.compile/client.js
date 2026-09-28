import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith } from "svelte-toolbelt";
import { Presence } from "./presence.svelte.js";

export default function Presence_layer($$anchor, $$props) {
	$.push($$props, true);

	const presenceState = new Presence({ open: boxWith(() => $$props.open), ref: $$props.ref });
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.presence ?? $.noop, () => ({
				present: presenceState.isPresent,
				transitionStatus: presenceState.transitionStatus
			}));

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($$props.forceMount || $$props.open || presenceState.isPresent) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}
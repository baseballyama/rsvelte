import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="container"> </div> <button>update tracked state</button>`, 1);

export default function Task($$anchor, $$props) {
	$.push($$props, true);

	let trackedState = $.state(0);
	const getTrackedState = () => $.get(trackedState);

	function dummyAction(el, { getTrackedState, propFromComponent }) {
		$.user_effect(() => {
			console.log("action $effect: ", { buttonClicked: getTrackedState() });
		});
	}

	var fragment = root();
	var div = $.first_child(fragment);
	var text = $.only_child(div, true);

	$.action(div, ($$node, $$action_arg) => dummyAction?.($$node, $$action_arg), () => ({ getTrackedState, propFromComponent: $$props.prop }));

	var button = $.sibling(div, 2);

	$.template_effect(($0) => $.set_text(text, $0), [() => JSON.stringify($$props.prop)]);

	$.delegated('click', button, () => {
		$.set(trackedState, $.get(trackedState) + 1);
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);
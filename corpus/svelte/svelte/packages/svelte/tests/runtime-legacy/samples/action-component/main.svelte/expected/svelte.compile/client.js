import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from "./sub.svelte";

var root = $.from_html(`<button> </button> <!>`, 1);

export default function Main($$anchor) {
	let state = 'foo';
	let param = '';

	function action(node, _param) {
		param = _param;

		return {
			update(_param) {
				param = _param;
			}
		};
	}

	var fragment = root();
	var button = $.first_child(fragment);
	var text = $.only_child(button);
	var node_1 = $.sibling(button, 2);

	Component(node_1, {
		action,
		get state() {
			return state;
		}
	});

	$.template_effect(() => $.set_text(text, `${state ?? ''} / ${param ?? ''}`));
	$.event('click', button, () => state = 'bar');
	$.append($$anchor, fragment);
}
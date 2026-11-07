import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Comp from './Comp.svelte';

var root = $.from_html(`<h1> </h1>`);
var root_1 = $.from_html(`<!> <button>Change</button>`, 1);

export default function Main($$anchor) {
	let p = "hi";
	var fragment = root_1();
	var node = $.first_child(fragment);

	Comp(node, {
		get someprop() {
			return p;
		},
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const props = $.derived(() => $$slotProps.props);
				var h1 = root();
				var text = $.only_child(h1, true);

				$.template_effect(() => $.set_text(text, $.get(props).someprop));
				$.append($$anchor, h1);
			}
		}
	});

	var button = $.sibling(node, 2);

	$.event('click', button, () => p = "changed");
	$.append($$anchor, fragment);
}
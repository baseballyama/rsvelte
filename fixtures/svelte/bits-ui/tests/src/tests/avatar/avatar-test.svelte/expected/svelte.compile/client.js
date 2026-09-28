import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Avatar } from "bits-ui";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<main><!> <button data-testid="clear-button">clear src</button></main>`);

export default function Avatar_test($$anchor, $$props) {
	let src = $.prop($$props, 'src', 7);
	var main = root_1();
	var node = $.child(main);

	$.component(node, () => Avatar.Root, ($$anchor, Avatar_Root) => {
		Avatar_Root($$anchor, {
			'data-testid': 'root',
			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Avatar.Image, ($$anchor, Avatar_Image) => {
					Avatar_Image($$anchor, {
						get src() {
							return src();
						},
						alt: 'huntabyte',
						'data-testid': 'image'
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Avatar.Fallback, ($$anchor, Avatar_Fallback) => {
					Avatar_Fallback($$anchor, {
						'data-testid': 'fallback',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('HJ');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	var button = $.sibling(node, 2);

	$.reset(main);
	$.delegated('click', button, () => src(""));
	$.append($$anchor, main);
}

$.delegate(['click']);
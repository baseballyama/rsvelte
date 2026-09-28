import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AlignmentButton, FontButton, FormatButton, ImageButton } from "@flowbite-svelte-plugins/texteditor";

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function CustomGroup($$anchor, $$props) {
	let showToolbar = $.prop($$props, 'showToolbar', 3, true);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			AlignmentButton(node_1, {
				get editor() {
					return $$props.editor;
				},
				alignment: 'left'
			});

			var node_2 = $.sibling(node_1, 2);

			AlignmentButton(node_2, {
				get editor() {
					return $$props.editor;
				},
				alignment: 'right'
			});

			var node_3 = $.sibling(node_2, 2);

			ImageButton(node_3, {
				get editor() {
					return $$props.editor;
				}
			});

			var node_4 = $.sibling(node_3, 2);

			FontButton(node_4, {
				get editor() {
					return $$props.editor;
				},
				format: 'fontSize'
			});

			var node_5 = $.sibling(node_4, 2);

			FormatButton(node_5, {
				get editor() {
					return $$props.editor;
				},
				format: 'italic'
			});

			var node_6 = $.sibling(node_5, 2);

			FormatButton(node_6, {
				get editor() {
					return $$props.editor;
				},
				format: 'link'
			});

			var node_7 = $.sibling(node_6, 2);

			FormatButton(node_7, {
				get editor() {
					return $$props.editor;
				},
				format: 'removeLink'
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($$props.editor && showToolbar()) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}
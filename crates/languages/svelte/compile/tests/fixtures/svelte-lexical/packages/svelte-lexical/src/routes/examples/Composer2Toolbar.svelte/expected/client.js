import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BoldButton } from '$lib/index.js';
import { Divider } from '$lib/index.js';
import { ItalicButton } from '$lib/index.js';
import { UnderlineButton } from '$lib/index.js';
import { StrikethroughButton } from '$lib/index.js';
import { FormatCodeButton } from '$lib/index.js';
import { DropDownAlign } from '$lib/index.js';
import { FontFamilyDropDown } from '$lib/index.js';
import { FontSizeDropDown } from '$lib/index.js';
import { Toolbar } from '$lib/index.js';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Composer2Toolbar($$anchor) {
	{
		const children = ($$anchor, $$arg0) => {
			let editor = () => ($$arg0?.()).editor;
			let activeEditor = () => ($$arg0?.()).activeEditor;
			let blockType = () => ($$arg0?.()).blockType;
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			FontFamilyDropDown(node, {});

			var node_1 = $.sibling(node, 2);

			FontSizeDropDown(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			Divider(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			BoldButton(node_3, {});

			var node_4 = $.sibling(node_3, 2);

			ItalicButton(node_4, {});

			var node_5 = $.sibling(node_4, 2);

			UnderlineButton(node_5, {});

			var node_6 = $.sibling(node_5, 2);

			StrikethroughButton(node_6, {});

			var node_7 = $.sibling(node_6, 2);

			FormatCodeButton(node_7, {});

			var node_8 = $.sibling(node_7, 2);

			Divider(node_8, {});

			var node_9 = $.sibling(node_8, 2);

			DropDownAlign(node_9, {});
			$.append($$anchor, fragment_1);
		};

		Toolbar($$anchor, { children, $$slots: { default: true } });
	}
}
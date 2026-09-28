import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CodeLanguageDropDown from '$lib/components/toolbar/CodeLanguageDropDown.svelte';
import DropDownBackColorPicker from '$lib/components/toolbar/DropDownBackColorPicker.svelte';
import DropDownTextColorPicker from '$lib/components/toolbar/DropDownTextColorPicker.svelte';

import {
	BlockFormatDropDown,
	CodeDropDrownItem,
	FontSizeEntry,
	InsertLink
} from '$lib/index.js';

import { BoldButton } from '$lib/index.js';
import { Divider } from '$lib/index.js';
import { RedoButton } from '$lib/index.js';
import { UndoButton } from '$lib/index.js';
import { ItalicButton } from '$lib/index.js';
import { UnderlineButton } from '$lib/index.js';
import { StrikethroughButton } from '$lib/index.js';
import { FormatCodeButton } from '$lib/index.js';
import { DropDownAlign } from '$lib/index.js';
import { InsertDropDown } from '$lib/index.js';
import { FontFamilyDropDown } from '$lib/index.js';
import { ParagraphDropDownItem } from '$lib/index.js';
import { HeadingDropDownItem } from '$lib/index.js';
import { BulletDropDrownItem } from '$lib/index.js';
import { NumberDropDrownItem } from '$lib/index.js';
import { CheckDropDrownItem } from '$lib/index.js';
import { QuoteDropDrownItem } from '$lib/index.js';
import { Toolbar } from '$lib/index.js';
import { InsertImageDialog } from '$lib/index.js';
import { InsertHRDropDownItem } from '$lib/index.js';
import { InsertImageDropDownItem } from '$lib/index.js';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Composer5Toolbar($$anchor) {
	{
		const children = ($$anchor, $$arg0) => {
			let editor = () => ($$arg0?.()).editor;
			let activeEditor = () => ($$arg0?.()).activeEditor;
			let blockType = () => ($$arg0?.()).blockType;
			var fragment_1 = root_3();
			var node = $.first_child(fragment_1);

			UndoButton(node, {});

			var node_1 = $.sibling(node, 2);

			RedoButton(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			Divider(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			{
				var consequent = ($$anchor) => {
					var fragment_2 = root_1();
					var node_4 = $.first_child(fragment_2);

					BlockFormatDropDown(node_4, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_5 = $.first_child(fragment_3);

							ParagraphDropDownItem(node_5, {});

							var node_6 = $.sibling(node_5, 2);

							HeadingDropDownItem(node_6, { headingSize: 'h1' });

							var node_7 = $.sibling(node_6, 2);

							HeadingDropDownItem(node_7, { headingSize: 'h2' });

							var node_8 = $.sibling(node_7, 2);

							HeadingDropDownItem(node_8, { headingSize: 'h3' });

							var node_9 = $.sibling(node_8, 2);

							NumberDropDrownItem(node_9, {});

							var node_10 = $.sibling(node_9, 2);

							BulletDropDrownItem(node_10, {});

							var node_11 = $.sibling(node_10, 2);

							CheckDropDrownItem(node_11, {});

							var node_12 = $.sibling(node_11, 2);

							QuoteDropDrownItem(node_12, {});

							var node_13 = $.sibling(node_12, 2);

							CodeDropDrownItem(node_13, {});
							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});

					var node_14 = $.sibling(node_4, 2);

					Divider(node_14, {});
					$.append($$anchor, fragment_2);
				};

				$.if(node_3, ($$render) => {
					if (activeEditor() === editor()) $$render(consequent);
				});
			}

			var node_15 = $.sibling(node_3, 2);

			{
				var consequent_1 = ($$anchor) => {
					CodeLanguageDropDown($$anchor, {});
				};

				var alternate = ($$anchor) => {
					var fragment_5 = root_2();
					var node_16 = $.first_child(fragment_5);

					FontFamilyDropDown(node_16, {});

					var node_17 = $.sibling(node_16, 2);

					FontSizeEntry(node_17, {});

					var node_18 = $.sibling(node_17, 2);

					Divider(node_18, {});

					var node_19 = $.sibling(node_18, 2);

					BoldButton(node_19, {});

					var node_20 = $.sibling(node_19, 2);

					ItalicButton(node_20, {});

					var node_21 = $.sibling(node_20, 2);

					UnderlineButton(node_21, {});

					var node_22 = $.sibling(node_21, 2);

					StrikethroughButton(node_22, {});

					var node_23 = $.sibling(node_22, 2);

					FormatCodeButton(node_23, {});

					var node_24 = $.sibling(node_23, 2);

					DropDownTextColorPicker(node_24, {});

					var node_25 = $.sibling(node_24, 2);

					DropDownBackColorPicker(node_25, {});

					var node_26 = $.sibling(node_25, 2);

					InsertLink(node_26, {});

					var node_27 = $.sibling(node_26, 2);

					Divider(node_27, {});

					var node_28 = $.sibling(node_27, 2);

					InsertDropDown(node_28, {
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root_1();
							var node_29 = $.first_child(fragment_6);

							InsertHRDropDownItem(node_29, {});

							var node_30 = $.sibling(node_29, 2);

							InsertImageDropDownItem(node_30, {});
							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});

					var node_31 = $.sibling(node_28, 2);

					Divider(node_31, {});
					$.append($$anchor, fragment_5);
				};

				$.if(node_15, ($$render) => {
					if (blockType() === 'code') $$render(consequent_1); else $$render(alternate, -1);
				});
			}

			var node_32 = $.sibling(node_15, 2);

			DropDownAlign(node_32, {});

			var node_33 = $.sibling(node_32, 2);

			InsertImageDialog(node_33, {});
			$.append($$anchor, fragment_1);
		};

		Toolbar($$anchor, { children, $$slots: { default: true } });
	}
}
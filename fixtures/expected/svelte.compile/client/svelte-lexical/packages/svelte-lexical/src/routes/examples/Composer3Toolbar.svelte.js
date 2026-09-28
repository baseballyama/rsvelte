import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DropDownBackColorPicker from '$lib/components/toolbar/DropDownBackColorPicker.svelte';
import DropDownTextColorPicker from '$lib/components/toolbar/DropDownTextColorPicker.svelte';
import { BlockFormatDropDown } from '$lib/index.js';
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
import { FontSizeDropDown } from '$lib/index.js';
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

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Composer3Toolbar($$anchor) {
	{
		const children = ($$anchor, $$arg0) => {
			let editor = () => ($$arg0?.()).editor;
			let activeEditor = () => ($$arg0?.()).activeEditor;
			let blockType = () => ($$arg0?.()).blockType;
			var fragment_1 = root_2();
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
							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});

					var node_13 = $.sibling(node_4, 2);

					Divider(node_13, {});
					$.append($$anchor, fragment_2);
				};

				$.if(node_3, ($$render) => {
					if (activeEditor() === editor()) $$render(consequent);
				});
			}

			var node_14 = $.sibling(node_3, 2);

			FontFamilyDropDown(node_14, {});

			var node_15 = $.sibling(node_14, 2);

			FontSizeDropDown(node_15, {});

			var node_16 = $.sibling(node_15, 2);

			Divider(node_16, {});

			var node_17 = $.sibling(node_16, 2);

			BoldButton(node_17, {});

			var node_18 = $.sibling(node_17, 2);

			ItalicButton(node_18, {});

			var node_19 = $.sibling(node_18, 2);

			UnderlineButton(node_19, {});

			var node_20 = $.sibling(node_19, 2);

			StrikethroughButton(node_20, {});

			var node_21 = $.sibling(node_20, 2);

			FormatCodeButton(node_21, {});

			var node_22 = $.sibling(node_21, 2);

			DropDownTextColorPicker(node_22, {});

			var node_23 = $.sibling(node_22, 2);

			DropDownBackColorPicker(node_23, {});

			var node_24 = $.sibling(node_23, 2);

			Divider(node_24, {});

			var node_25 = $.sibling(node_24, 2);

			InsertDropDown(node_25, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_1();
					var node_26 = $.first_child(fragment_4);

					InsertHRDropDownItem(node_26, {});

					var node_27 = $.sibling(node_26, 2);

					InsertImageDropDownItem(node_27, {});
					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			var node_28 = $.sibling(node_25, 2);

			Divider(node_28, {});

			var node_29 = $.sibling(node_28, 2);

			DropDownAlign(node_29, {});

			var node_30 = $.sibling(node_29, 2);

			InsertImageDialog(node_30, {});
			$.append($$anchor, fragment_1);
		};

		Toolbar($$anchor, { children, $$slots: { default: true } });
	}
}
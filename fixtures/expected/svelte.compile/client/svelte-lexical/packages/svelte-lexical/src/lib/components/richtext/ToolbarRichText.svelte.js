import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import BlockFormatDropDown from '../toolbar/BlockFormatDropDown/BlockFormatDropDown.svelte';
import BoldButton from '../toolbar/BoldButton.svelte';
import Divider from '../toolbar/Divider.svelte';
import RedoButton from '../toolbar/RedoButton.svelte';
import UndoButton from '../toolbar/UndoButton.svelte';
import ItalicButton from '../toolbar/ItalicButton.svelte';
import UnderlineButton from '../toolbar/UnderlineButton.svelte';
import StrikethroughButton from '../toolbar/StrikethroughButton.svelte';
import FormatCodeButton from '../toolbar/FormatCodeButton.svelte';
import DropDownAlign from '../toolbar/DropDownAlign.svelte';
import InsertDropDown from '../toolbar/InsertDropDown/InsertDropDown.svelte';
import FontFamilyDropDown from '../toolbar/FontFamilyDropDown.svelte';
import FontSizeDropDown from '../toolbar/FontSizeDropDown.svelte';
import ParagraphDropDownItem from '../toolbar/BlockFormatDropDown/ParagraphDropDownItem.svelte';
import HeadingDropDownItem from '../toolbar/BlockFormatDropDown/HeadingDropDownItem.svelte';
import BulletDropDrownItem from '../toolbar/BlockFormatDropDown/BulletDropDrownItem.svelte';
import NumberDropDrownItem from '../toolbar/BlockFormatDropDown/NumberDropDrownItem.svelte';
import CheckDropDrownItem from '../toolbar/BlockFormatDropDown/CheckDropDrownItem.svelte';
import QuoteDropDrownItem from '../toolbar/BlockFormatDropDown/QuoteDropDrownItem.svelte';
import Toolbar from '../toolbar/Toolbar.svelte';
import InsertImageDialog from '../toolbar/dialogs/InsertImageDialog.svelte';
import InsertHRDropDownItem from '../toolbar/InsertDropDown/InsertHRDropDownItem.svelte';
import InsertImageDropDownItem from '../toolbar/InsertDropDown/InsertImageDropDownItem.svelte';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function ToolbarRichText($$anchor) {
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

			Divider(node_22, {});

			var node_23 = $.sibling(node_22, 2);

			InsertDropDown(node_23, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_1();
					var node_24 = $.first_child(fragment_4);

					InsertHRDropDownItem(node_24, {});

					var node_25 = $.sibling(node_24, 2);

					InsertImageDropDownItem(node_25, {});
					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			var node_26 = $.sibling(node_23, 2);

			Divider(node_26, {});

			var node_27 = $.sibling(node_26, 2);

			DropDownAlign(node_27, {});

			var node_28 = $.sibling(node_27, 2);

			InsertImageDialog(node_28, {});
			$.append($$anchor, fragment_1);
		};

		Toolbar($$anchor, { children, $$slots: { default: true } });
	}
}
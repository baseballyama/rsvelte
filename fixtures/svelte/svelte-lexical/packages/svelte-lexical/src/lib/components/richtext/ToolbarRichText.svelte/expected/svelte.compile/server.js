import * as $ from 'svelte/internal/server';
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

export default function ToolbarRichText($$renderer) {
	{
		function children($$renderer, { editor, activeEditor, blockType }) {
			UndoButton($$renderer, {});
			$$renderer.push(`<!----> `);
			RedoButton($$renderer, {});
			$$renderer.push(`<!----> `);
			Divider($$renderer, {});
			$$renderer.push(`<!----> `);

			if (activeEditor === editor) {
				$$renderer.push('<!--[0-->');

				BlockFormatDropDown($$renderer, {
					children: ($$renderer) => {
						ParagraphDropDownItem($$renderer, {});
						$$renderer.push(`<!----> `);
						HeadingDropDownItem($$renderer, { headingSize: 'h1' });
						$$renderer.push(`<!----> `);
						HeadingDropDownItem($$renderer, { headingSize: 'h2' });
						$$renderer.push(`<!----> `);
						HeadingDropDownItem($$renderer, { headingSize: 'h3' });
						$$renderer.push(`<!----> `);
						NumberDropDrownItem($$renderer, {});
						$$renderer.push(`<!----> `);
						BulletDropDrownItem($$renderer, {});
						$$renderer.push(`<!----> `);
						CheckDropDrownItem($$renderer, {});
						$$renderer.push(`<!----> `);
						QuoteDropDrownItem($$renderer, {});
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);
				Divider($$renderer, {});
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);
			FontFamilyDropDown($$renderer, {});
			$$renderer.push(`<!----> `);
			FontSizeDropDown($$renderer, {});
			$$renderer.push(`<!----> `);
			Divider($$renderer, {});
			$$renderer.push(`<!----> `);
			BoldButton($$renderer, {});
			$$renderer.push(`<!----> `);
			ItalicButton($$renderer, {});
			$$renderer.push(`<!----> `);
			UnderlineButton($$renderer, {});
			$$renderer.push(`<!----> `);
			StrikethroughButton($$renderer, {});
			$$renderer.push(`<!----> `);
			FormatCodeButton($$renderer, {});
			$$renderer.push(`<!----> `);
			Divider($$renderer, {});
			$$renderer.push(`<!----> `);

			InsertDropDown($$renderer, {
				children: ($$renderer) => {
					InsertHRDropDownItem($$renderer, {});
					$$renderer.push(`<!----> `);
					InsertImageDropDownItem($$renderer, {});
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);
			Divider($$renderer, {});
			$$renderer.push(`<!----> `);
			DropDownAlign($$renderer, {});
			$$renderer.push(`<!----> `);
			InsertImageDialog($$renderer, {});
			$$renderer.push(`<!---->`);
		}

		Toolbar($$renderer, { children, $$slots: { default: true } });
	}
}
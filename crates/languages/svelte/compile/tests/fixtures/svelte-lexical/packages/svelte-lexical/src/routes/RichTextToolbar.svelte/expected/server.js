import * as $ from 'svelte/internal/server';
import InsertTableDialog from '$lib/components/toolbar/dialogs/InsertTableDialog.svelte';
import DropDownBackColorPicker from '$lib/components/toolbar/DropDownBackColorPicker.svelte';
import DropDownTextColorPicker from '$lib/components/toolbar/DropDownTextColorPicker.svelte';
import InsertTableDropDownItem from '$lib/components/toolbar/InsertDropDown/InsertTableDropDownItem.svelte';

import {
	BlockFormatDropDown,
	ClearFormattingDropDownItem,
	CodeDropDrownItem,
	CodeLanguageDropDown,
	FontSizeEntry,
	InsertLink,
	MoreStylesDropDown,
	StrikethroughDropDownItem,
	SubscriptDropDownItem,
	SuperscriptDropDownItem
} from '../lib/index.js';

import { BoldButton } from '../lib/index.js';
import { Divider } from '../lib/index.js';
import { RedoButton } from '../lib/index.js';
import { UndoButton } from '../lib/index.js';
import { ItalicButton } from '../lib/index.js';
import { UnderlineButton } from '../lib/index.js';
import { StrikethroughButton } from '../lib/index.js';
import { FormatCodeButton } from '../lib/index.js';
import { DropDownAlign } from '../lib/index.js';
import { InsertDropDown } from '../lib/index.js';
import { FontFamilyDropDown } from '../lib/index.js';
import { ParagraphDropDownItem } from '../lib/index.js';
import { HeadingDropDownItem } from '../lib/index.js';
import { BulletDropDrownItem } from '../lib/index.js';
import { NumberDropDrownItem } from '../lib/index.js';
import { CheckDropDrownItem } from '../lib/index.js';
import { QuoteDropDrownItem } from '../lib/index.js';
import { Toolbar } from '../lib/index.js';
import { InsertImageDialog } from '../lib/index.js';
import { InsertHRDropDownItem } from '../lib/index.js';
import { InsertImageDropDownItem } from '../lib/index.js';
import { InsertColumnLayoutDropDownItem } from '../lib/index.js';
import { InsertColumnsDialog } from '../lib/index.js';
import ShortcutsPlugin from '$lib/components/toolbar/ShortcutsPlugin.svelte';
import InsertYoutubeDialog from '$lib/components/toolbar/dialogs/InsertYoutubeDialog.svelte';
import InsertYoutubeDropDownItem from '$lib/components/toolbar/InsertDropDown/InsertYoutubeDropDownItem.svelte';
import InsertTweetDialog from '$lib/components/toolbar/dialogs/InsertTweetDialog.svelte';
import InsertTweetDropDownItem from '$lib/components/toolbar/InsertDropDown/InsertTweetDropDownItem.svelte';
import InsertBlueskyDialog from '$lib/components/toolbar/dialogs/InsertBlueskyDialog.svelte';
import InsertBlueskyDropDownItem from '$lib/components/toolbar/InsertDropDown/InsertBlueskyDropDownItem.svelte';

export default function RichTextToolbar($$renderer) {
	{
		function children($$renderer, { editor, activeEditor, blockType }) {
			ShortcutsPlugin($$renderer, {});
			$$renderer.push(`<!----> `);
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
						$$renderer.push(`<!----> `);
						CodeDropDrownItem($$renderer, {});
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

			if (blockType === 'code') {
				$$renderer.push('<!--[0-->');
				CodeLanguageDropDown($$renderer, {});
			} else {
				$$renderer.push('<!--[-1-->');
				FontFamilyDropDown($$renderer, {});
				$$renderer.push(`<!----> `);
				FontSizeEntry($$renderer, {});
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
				DropDownTextColorPicker($$renderer, {});
				$$renderer.push(`<!----> `);
				DropDownBackColorPicker($$renderer, {});
				$$renderer.push(`<!----> `);

				MoreStylesDropDown($$renderer, {
					children: ($$renderer) => {
						StrikethroughDropDownItem($$renderer, {});
						$$renderer.push(`<!----> `);
						SubscriptDropDownItem($$renderer, {});
						$$renderer.push(`<!----> `);
						SuperscriptDropDownItem($$renderer, {});
						$$renderer.push(`<!----> `);
						ClearFormattingDropDownItem($$renderer, {});
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);
				Divider($$renderer, {});
				$$renderer.push(`<!----> `);
				InsertLink($$renderer, {});
				$$renderer.push(`<!----> `);
				Divider($$renderer, {});
				$$renderer.push(`<!----> `);

				InsertDropDown($$renderer, {
					children: ($$renderer) => {
						InsertHRDropDownItem($$renderer, {});
						$$renderer.push(`<!----> `);
						InsertImageDropDownItem($$renderer, {});
						$$renderer.push(`<!----> `);
						InsertColumnLayoutDropDownItem($$renderer, {});
						$$renderer.push(`<!----> `);
						InsertTableDropDownItem($$renderer, {});
						$$renderer.push(`<!----> `);
						InsertYoutubeDropDownItem($$renderer, {});
						$$renderer.push(`<!----> `);
						InsertTweetDropDownItem($$renderer, {});
						$$renderer.push(`<!----> `);
						InsertBlueskyDropDownItem($$renderer, {});
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);
				Divider($$renderer, {});
				$$renderer.push(`<!---->`);
			}

			$$renderer.push(`<!--]--> `);
			DropDownAlign($$renderer, {});
			$$renderer.push(`<!----> `);
			InsertImageDialog($$renderer, {});
			$$renderer.push(`<!----> `);
			InsertColumnsDialog($$renderer, {});
			$$renderer.push(`<!----> `);
			InsertTableDialog($$renderer, {});
			$$renderer.push(`<!----> `);
			InsertYoutubeDialog($$renderer, {});
			$$renderer.push(`<!----> `);
			InsertTweetDialog($$renderer, {});
			$$renderer.push(`<!----> `);
			InsertBlueskyDialog($$renderer, {});
			$$renderer.push(`<!---->`);
		}

		Toolbar($$renderer, { children, $$slots: { default: true } });
	}
}
import * as $ from 'svelte/internal/server';
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

export default function Composer5Toolbar($$renderer) {
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
				InsertLink($$renderer, {});
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
				$$renderer.push(`<!---->`);
			}

			$$renderer.push(`<!--]--> `);
			DropDownAlign($$renderer, {});
			$$renderer.push(`<!----> `);
			InsertImageDialog($$renderer, {});
			$$renderer.push(`<!---->`);
		}

		Toolbar($$renderer, { children, $$slots: { default: true } });
	}
}
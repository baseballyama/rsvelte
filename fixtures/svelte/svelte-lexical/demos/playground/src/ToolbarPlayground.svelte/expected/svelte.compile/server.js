import * as $ from 'svelte/internal/server';

import {
	BlockFormatDropDown,
	UndoButton,
	RedoButton,
	Toolbar,
	Divider,
	ParagraphDropDownItem,
	HeadingDropDownItem,
	BulletDropDrownItem,
	NumberDropDrownItem,
	CheckDropDrownItem,
	QuoteDropDrownItem,
	CodeDropDrownItem,
	CodeLanguageDropDown,
	FontFamilyDropDown,
	FontSizeEntry,
	BoldButton,
	ItalicButton,
	UnderlineButton,
	InsertLink,
	FormatCodeButton,
	InsertDropDown,
	DropDownAlign,
	InsertHRDropDownItem,
	InsertImageDropDownItem,
	MoreStylesDropDown,
	StrikethroughDropDownItem,
	SubscriptDropDownItem,
	SuperscriptDropDownItem,
	ClearFormattingDropDownItem,
	DropDownTextColorPicker,
	DropDownBackColorPicker,
	InsertColumnLayoutDropDownItem,
	InsertColumnsDialog,
	InsertTableDialog,
	InsertTableDropDownItem,
	ShortcutsPlugin,
	InsertYoutubeDialog,
	InsertYoutubeDropDownItem,
	InsertTweetDropDownItem,
	InsertTweetDialog,
	InsertBlueskyDialog,
	InsertBlueskyDropDownItem
} from 'svelte-lexical';

import { CodeThemeShikiDropDown } from 'svelte-lexical/shiki';
import InsertImageDialog from './InsertImageDialog.svelte';
import { getContext } from 'svelte';

export default function ToolbarPlayground($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		// FontSizeDropDown,
		const settings = getContext('settings');

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
					$$renderer.push(`<!----> `);

					if ($.store_get($$store_subs ??= {}, '$settings', settings).isCodeShiki) {
						$$renderer.push('<!--[0-->');
						CodeThemeShikiDropDown($$renderer, {});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
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
					FormatCodeButton($$renderer, {});
					$$renderer.push(`<!----> `);
					DropDownTextColorPicker($$renderer, {});
					$$renderer.push(`<!----> `);
					DropDownBackColorPicker($$renderer, {});
					$$renderer.push(`<!----> `);
					InsertLink($$renderer, {});
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

					if (activeEditor === editor) {
						$$renderer.push('<!--[0-->');

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
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
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

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}
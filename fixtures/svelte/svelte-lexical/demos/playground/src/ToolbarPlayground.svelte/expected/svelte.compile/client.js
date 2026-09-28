import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

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

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function ToolbarPlayground($$anchor, $$props) {
	$.push($$props, true);

	const $settings = () => $.store_get(settings, '$settings', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	// FontSizeDropDown,
	const settings = getContext('settings');

	{
		const children = ($$anchor, $$arg0) => {
			let editor = () => ($$arg0?.()).editor;
			let activeEditor = () => ($$arg0?.()).activeEditor;
			let blockType = () => ($$arg0?.()).blockType;
			var fragment_1 = root_4();
			var node = $.first_child(fragment_1);

			ShortcutsPlugin(node, {});

			var node_1 = $.sibling(node, 2);

			UndoButton(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			RedoButton(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			Divider(node_3, {});

			var node_4 = $.sibling(node_3, 2);

			{
				var consequent = ($$anchor) => {
					var fragment_2 = root_1();
					var node_5 = $.first_child(fragment_2);

					BlockFormatDropDown(node_5, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_6 = $.first_child(fragment_3);

							ParagraphDropDownItem(node_6, {});

							var node_7 = $.sibling(node_6, 2);

							HeadingDropDownItem(node_7, { headingSize: 'h1' });

							var node_8 = $.sibling(node_7, 2);

							HeadingDropDownItem(node_8, { headingSize: 'h2' });

							var node_9 = $.sibling(node_8, 2);

							HeadingDropDownItem(node_9, { headingSize: 'h3' });

							var node_10 = $.sibling(node_9, 2);

							NumberDropDrownItem(node_10, {});

							var node_11 = $.sibling(node_10, 2);

							BulletDropDrownItem(node_11, {});

							var node_12 = $.sibling(node_11, 2);

							CheckDropDrownItem(node_12, {});

							var node_13 = $.sibling(node_12, 2);

							QuoteDropDrownItem(node_13, {});

							var node_14 = $.sibling(node_13, 2);

							CodeDropDrownItem(node_14, {});
							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});

					var node_15 = $.sibling(node_5, 2);

					Divider(node_15, {});
					$.append($$anchor, fragment_2);
				};

				$.if(node_4, ($$render) => {
					if (activeEditor() === editor()) $$render(consequent);
				});
			}

			var node_16 = $.sibling(node_4, 2);

			{
				var consequent_2 = ($$anchor) => {
					var fragment_4 = root_1();
					var node_17 = $.first_child(fragment_4);

					CodeLanguageDropDown(node_17, {});

					var node_18 = $.sibling(node_17, 2);

					{
						var consequent_1 = ($$anchor) => {
							CodeThemeShikiDropDown($$anchor, {});
						};

						$.if(node_18, ($$render) => {
							if ($settings().isCodeShiki) $$render(consequent_1);
						});
					}

					$.append($$anchor, fragment_4);
				};

				var alternate = ($$anchor) => {
					var fragment_6 = root_4();
					var node_19 = $.first_child(fragment_6);

					FontFamilyDropDown(node_19, {});

					var node_20 = $.sibling(node_19, 2);

					FontSizeEntry(node_20, {});

					var node_21 = $.sibling(node_20, 2);

					Divider(node_21, {});

					var node_22 = $.sibling(node_21, 2);

					BoldButton(node_22, {});

					var node_23 = $.sibling(node_22, 2);

					ItalicButton(node_23, {});

					var node_24 = $.sibling(node_23, 2);

					UnderlineButton(node_24, {});

					var node_25 = $.sibling(node_24, 2);

					FormatCodeButton(node_25, {});

					var node_26 = $.sibling(node_25, 2);

					DropDownTextColorPicker(node_26, {});

					var node_27 = $.sibling(node_26, 2);

					DropDownBackColorPicker(node_27, {});

					var node_28 = $.sibling(node_27, 2);

					InsertLink(node_28, {});

					var node_29 = $.sibling(node_28, 2);

					MoreStylesDropDown(node_29, {
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = root_2();
							var node_30 = $.first_child(fragment_7);

							StrikethroughDropDownItem(node_30, {});

							var node_31 = $.sibling(node_30, 2);

							SubscriptDropDownItem(node_31, {});

							var node_32 = $.sibling(node_31, 2);

							SuperscriptDropDownItem(node_32, {});

							var node_33 = $.sibling(node_32, 2);

							ClearFormattingDropDownItem(node_33, {});
							$.append($$anchor, fragment_7);
						},
						$$slots: { default: true }
					});

					var node_34 = $.sibling(node_29, 2);

					Divider(node_34, {});

					var node_35 = $.sibling(node_34, 2);

					{
						var consequent_3 = ($$anchor) => {
							var fragment_8 = root_1();
							var node_36 = $.first_child(fragment_8);

							InsertDropDown(node_36, {
								children: ($$anchor, $$slotProps) => {
									var fragment_9 = root_3();
									var node_37 = $.first_child(fragment_9);

									InsertHRDropDownItem(node_37, {});

									var node_38 = $.sibling(node_37, 2);

									InsertImageDropDownItem(node_38, {});

									var node_39 = $.sibling(node_38, 2);

									InsertColumnLayoutDropDownItem(node_39, {});

									var node_40 = $.sibling(node_39, 2);

									InsertTableDropDownItem(node_40, {});

									var node_41 = $.sibling(node_40, 2);

									InsertYoutubeDropDownItem(node_41, {});

									var node_42 = $.sibling(node_41, 2);

									InsertTweetDropDownItem(node_42, {});

									var node_43 = $.sibling(node_42, 2);

									InsertBlueskyDropDownItem(node_43, {});
									$.append($$anchor, fragment_9);
								},
								$$slots: { default: true }
							});

							var node_44 = $.sibling(node_36, 2);

							Divider(node_44, {});
							$.append($$anchor, fragment_8);
						};

						$.if(node_35, ($$render) => {
							if (activeEditor() === editor()) $$render(consequent_3);
						});
					}

					$.append($$anchor, fragment_6);
				};

				$.if(node_16, ($$render) => {
					if (blockType() === 'code') $$render(consequent_2); else $$render(alternate, -1);
				});
			}

			var node_45 = $.sibling(node_16, 2);

			DropDownAlign(node_45, {});

			var node_46 = $.sibling(node_45, 2);

			InsertImageDialog(node_46, {});

			var node_47 = $.sibling(node_46, 2);

			InsertColumnsDialog(node_47, {});

			var node_48 = $.sibling(node_47, 2);

			InsertTableDialog(node_48, {});

			var node_49 = $.sibling(node_48, 2);

			InsertYoutubeDialog(node_49, {});

			var node_50 = $.sibling(node_49, 2);

			InsertTweetDialog(node_50, {});

			var node_51 = $.sibling(node_50, 2);

			InsertBlueskyDialog(node_51, {});
			$.append($$anchor, fragment_1);
		};

		Toolbar($$anchor, { children, $$slots: { default: true } });
	}

	$.pop();
	$$cleanup();
}
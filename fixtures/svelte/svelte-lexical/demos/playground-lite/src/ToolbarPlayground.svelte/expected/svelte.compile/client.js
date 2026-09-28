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

import InsertImageDialog from './InsertImageDialog.svelte';
import { getContext } from 'svelte';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function ToolbarPlayground($$anchor, $$props) {
	$.push($$props, true);

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
				var consequent_1 = ($$anchor) => {
					CodeLanguageDropDown($$anchor, {});
				};

				var alternate = ($$anchor) => {
					var fragment_5 = root_4();
					var node_17 = $.first_child(fragment_5);

					FontFamilyDropDown(node_17, {});

					var node_18 = $.sibling(node_17, 2);

					FontSizeEntry(node_18, {});

					var node_19 = $.sibling(node_18, 2);

					Divider(node_19, {});

					var node_20 = $.sibling(node_19, 2);

					BoldButton(node_20, {});

					var node_21 = $.sibling(node_20, 2);

					ItalicButton(node_21, {});

					var node_22 = $.sibling(node_21, 2);

					UnderlineButton(node_22, {});

					var node_23 = $.sibling(node_22, 2);

					FormatCodeButton(node_23, {});

					var node_24 = $.sibling(node_23, 2);

					DropDownTextColorPicker(node_24, {});

					var node_25 = $.sibling(node_24, 2);

					DropDownBackColorPicker(node_25, {});

					var node_26 = $.sibling(node_25, 2);

					InsertLink(node_26, {});

					var node_27 = $.sibling(node_26, 2);

					MoreStylesDropDown(node_27, {
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root_2();
							var node_28 = $.first_child(fragment_6);

							StrikethroughDropDownItem(node_28, {});

							var node_29 = $.sibling(node_28, 2);

							SubscriptDropDownItem(node_29, {});

							var node_30 = $.sibling(node_29, 2);

							SuperscriptDropDownItem(node_30, {});

							var node_31 = $.sibling(node_30, 2);

							ClearFormattingDropDownItem(node_31, {});
							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});

					var node_32 = $.sibling(node_27, 2);

					Divider(node_32, {});

					var node_33 = $.sibling(node_32, 2);

					{
						var consequent_2 = ($$anchor) => {
							var fragment_7 = root_1();
							var node_34 = $.first_child(fragment_7);

							InsertDropDown(node_34, {
								children: ($$anchor, $$slotProps) => {
									var fragment_8 = root_3();
									var node_35 = $.first_child(fragment_8);

									InsertHRDropDownItem(node_35, {});

									var node_36 = $.sibling(node_35, 2);

									InsertImageDropDownItem(node_36, {});

									var node_37 = $.sibling(node_36, 2);

									InsertColumnLayoutDropDownItem(node_37, {});

									var node_38 = $.sibling(node_37, 2);

									InsertTableDropDownItem(node_38, {});

									var node_39 = $.sibling(node_38, 2);

									InsertYoutubeDropDownItem(node_39, {});

									var node_40 = $.sibling(node_39, 2);

									InsertTweetDropDownItem(node_40, {});

									var node_41 = $.sibling(node_40, 2);

									InsertBlueskyDropDownItem(node_41, {});
									$.append($$anchor, fragment_8);
								},
								$$slots: { default: true }
							});

							var node_42 = $.sibling(node_34, 2);

							Divider(node_42, {});
							$.append($$anchor, fragment_7);
						};

						$.if(node_33, ($$render) => {
							if (activeEditor() === editor()) $$render(consequent_2);
						});
					}

					$.append($$anchor, fragment_5);
				};

				$.if(node_16, ($$render) => {
					if (blockType() === 'code') $$render(consequent_1); else $$render(alternate, -1);
				});
			}

			var node_43 = $.sibling(node_16, 2);

			DropDownAlign(node_43, {});

			var node_44 = $.sibling(node_43, 2);

			InsertImageDialog(node_44, {});

			var node_45 = $.sibling(node_44, 2);

			InsertColumnsDialog(node_45, {});

			var node_46 = $.sibling(node_45, 2);

			InsertTableDialog(node_46, {});

			var node_47 = $.sibling(node_46, 2);

			InsertYoutubeDialog(node_47, {});

			var node_48 = $.sibling(node_47, 2);

			InsertTweetDialog(node_48, {});

			var node_49 = $.sibling(node_48, 2);

			InsertBlueskyDialog(node_49, {});
			$.append($$anchor, fragment_1);
		};

		Toolbar($$anchor, { children, $$slots: { default: true } });
	}

	$.pop();
}
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext, onMount } from 'svelte';

import {
	Composer,
	ContentEditable,
	ActionBar,
	RichTextPlugin,
	SharedHistoryPlugin,
	ListPlugin,
	CheckListPlugin,
	HorizontalRulePlugin,
	ImagePlugin,
	AutoFocusPlugin,
	HeadingNode,
	QuoteNode,
	ListNode,
	ListItemNode,
	HorizontalRuleNode,
	ImageNode,
	TreeViewPlugin,
	PlaceHolder,
	KeywordPlugin,
	KeywordNode,
	HashtagPlugin,
	HashtagNode,
	CollaborationPlugin,
	PlainTextPlugin,
	AutoLinkPlugin,
	AutoLinkNode,
	LinkPlugin,
	LinkNode,
	validateUrl,
	FloatingLinkEditorPlugin,
	CodeNode,
	CodeHighlightNode,
	CodeHighlightPrismPlugin,
	CodeActionMenuPlugin,
	CaptionEditorCollaborationPlugin,
	CaptionEditorHistoryPlugin,
	CAN_USE_DOM,
	MarkdownShortcutPlugin,
	ALL_TRANSFORMERS,
	ColumnLayoutPlugin,
	LayoutContainerNode,
	LayoutItemNode,
	TableNode,
	TableCellNode,
	TableRowNode,
	TablePlugin,
	TableHoverActionPlugin,
	TableActionMenuPlugin,
	TableCellResizerPlugin,
	YoutubePlugin,
	YouTubeNode,
	TweetNode,
	TwitterPlugin,
	BlueskyPlugin,
	BlueskyNode,
	TabIndentationPlugin,
	ComponentPickerMenuPlugin
} from 'svelte-lexical';

import { prepopulatedRichText } from './prepopulatedRichText';
import PlaygroundEditorTheme from './themes/PlaygroundEditorTheme';
import ToolbarPlayground from './ToolbarPlayground.svelte';
import { createWebsocketProvider } from './collaboration';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="editor-shell"><!> <div class="editor-container tree-view"><div class="editor-scroller"><div class="editor"><!> <!></div></div> <!> <!> <!> <!> <!> <!> <!> <!></div> <!></div>`);

export default function RichTextComposer($$anchor, $$props) {
	$.push($$props, true);

	const $settings = () => $.store_get(settings, '$settings', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const keywordsRegex = /(^|$|[^A-Za-zªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮͰ-ʹͶͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԧԱ-Ֆՙա-ևא-תװ-ײؠ-يٮٯٱ-ۓەۥۦۮۯۺ-ۼۿܐܒ-ܯݍ-ޥޱߊ-ߪߴߵߺࠀ-ࠕࠚࠤࠨࡀ-ࡘࢠࢢ-ࢬऄ-हऽॐक़-ॡॱ-ॷॹ-ॿঅ-ঌএঐও-নপ-রলশ-হঽৎড়ঢ়য়-ৡৰৱਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹਖ਼-ੜਫ਼ੲ-ੴઅ-ઍએ-ઑઓ-નપ-રલળવ-હઽૐૠૡଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହଽଡ଼ଢ଼ୟ-ୡୱஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹௐఅ-ఌఎ-ఐఒ-నప-ళవ-హఽౘౙౠౡಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹಽೞೠೡೱೲഅ-ഌഎ-ഐഒ-ഺഽൎൠൡൺ-ൿඅ-ඖක-නඳ-රලව-ෆก-ะาำเ-ๆກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ະາຳຽເ-ໄໆໜ-ໟༀཀ-ཇཉ-ཬྈ-ྌက-ဪဿၐ-ၕၚ-ၝၡၥၦၮ-ၰၵ-ႁႎႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚᎀ-ᎏᎠ-Ᏼᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᜀ-ᜌᜎ-ᜑᜠ-ᜱᝀ-ᝑᝠ-ᝬᝮ-ᝰក-ឳៗៜᠠ-ᡷᢀ-ᢨᢪᢰ-ᣵᤀ-ᤜᥐ-ᥭᥰ-ᥴᦀ-ᦫᧁ-ᧇᨀ-ᨖᨠ-ᩔᪧᬅ-ᬳᭅ-ᭋᮃ-ᮠᮮᮯᮺ-ᯥᰀ-ᰣᱍ-ᱏᱚ-ᱽᳩ-ᳬᳮ-ᳱᳵᳶᴀ-ᶿḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿₐ-ₜℂℇℊ-ℓℕℙ-ℝℤΩℨK-ℭℯ-ℹℼ-ℿⅅ-ⅉⅎↃↄⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳮⳲⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞⸯ々〆〱-〵〻〼ぁ-ゖゝ-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿌ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘟꘪꘫꙀ-ꙮꙿ-ꚗꚠ-ꛥꜗ-ꜟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꠁꠃ-ꠅꠇ-ꠊꠌ-ꠢꡀ-ꡳꢂ-ꢳꣲ-ꣷꣻꤊ-ꤥꤰ-ꥆꥠ-ꥼꦄ-ꦲꧏꨀ-ꨨꩀ-ꩂꩄ-ꩋꩠ-ꩶꩺꪀ-ꪯꪱꪵꪶꪹ-ꪽꫀꫂꫛ-ꫝꫠ-ꫪꫲ-ꫴꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꯀ-ꯢ가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִײַ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼＡ-Ｚａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ])(congrats|congratulations|gratuluju|gratuluji|gratulujeme|blahopřeju|blahopřeji|blahopřejeme|Til lykke|Tillykke|Glückwunsch|Gratuliere|felicitaciones|enhorabuena|paljon onnea|onnittelut|Félicitations|gratula|gratulálok|gratulálunk|congratulazioni|complimenti|おめでとう|おめでとうございます|축하해|축하해요|gratulerer|Gefeliciteerd|gratulacje|Parabéns|parabéns|felicitações|felicitări|мои поздравления|поздравляем|поздравляю|gratulujem|blahoželám|ยินดีด้วย|ขอแสดงความยินดี|tebrikler|tebrik ederim|恭喜|祝贺你|恭喜你|恭喜|恭喜|baie geluk|veels geluk|অভিনন্দন|Čestitam|Čestitke|Čestitamo|Συγχαρητήρια|Μπράβο|અભિનંદન|badhai|बधाई|अभिनंदन|Честитам|Свака част|hongera|வாழ்த்துகள்|வாழ்த்துக்கள்|అభినందనలు|അഭിനന്ദനങ്ങൾ|Chúc mừng|מזל טוב|mazel tov|mazal tov)(^|$|[^A-Za-zªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮͰ-ʹͶͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԧԱ-Ֆՙա-ևא-תװ-ײؠ-يٮٯٱ-ۓەۥۦۮۯۺ-ۼۿܐܒ-ܯݍ-ޥޱߊ-ߪߴߵߺࠀ-ࠕࠚࠤࠨࡀ-ࡘࢠࢢ-ࢬऄ-हऽॐक़-ॡॱ-ॷॹ-ॿঅ-ঌএঐও-নপ-রলশ-হঽৎড়ঢ়য়-ৡৰৱਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹਖ਼-ੜਫ਼ੲ-ੴઅ-ઍએ-ઑઓ-નપ-રલળવ-હઽૐૠૡଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହଽଡ଼ଢ଼ୟ-ୡୱஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹௐఅ-ఌఎ-ఐఒ-నప-ళవ-హఽౘౙౠౡಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹಽೞೠೡೱೲഅ-ഌഎ-ഐഒ-ഺഽൎൠൡൺ-ൿඅ-ඖක-නඳ-රලව-ෆก-ะาำเ-ๆກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ະາຳຽເ-ໄໆໜ-ໟༀཀ-ཇཉ-ཬྈ-ྌက-ဪဿၐ-ၕၚ-ၝၡၥၦၮ-ၰၵ-ႁႎႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚᎀ-ᎏᎠ-Ᏼᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᜀ-ᜌᜎ-ᜑᜠ-ᜱᝀ-ᝑᝠ-ᝬᝮ-ᝰក-ឳៗៜᠠ-ᡷᢀ-ᢨᢪᢰ-ᣵᤀ-ᤜᥐ-ᥭᥰ-ᥴᦀ-ᦫᧁ-ᧇᨀ-ᨖᨠ-ᩔᪧᬅ-ᬳᭅ-ᭋᮃ-ᮠᮮᮯᮺ-ᯥᰀ-ᰣᱍ-ᱏᱚ-ᱽᳩ-ᳬᳮ-ᳱᳵᳶᴀ-ᶿḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿₐ-ₜℂℇℊ-ℓℕℙ-ℝℤΩℨK-ℭℯ-ℹℼ-ℿⅅ-ⅉⅎↃↄⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳮⳲⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞⸯ々〆〱-〵〻〼ぁ-ゖゝ-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿌ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘟꘪꘫꙀ-ꙮꙿ-ꚗꚠ-ꛥꜗ-ꜟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꠁꠃ-ꠅꠇ-ꠊꠌ-ꠢꡀ-ꡳꢂ-ꢳꣲ-ꣷꣻꤊ-ꤥꤰ-ꥆꥠ-ꥼꦄ-ꦲꧏꨀ-ꨨꩀ-ꩂꩄ-ꩋꩠ-ꩶꩺꪀ-ꪯꪱꪵꪶꪹ-ꪽꫀꫂꫛ-ꫝꫠ-ꫪꫲ-ꫴꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꯀ-ꯢ가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִײַ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼＡ-Ｚａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ])/i;
	const settings = getContext('settings');

	const skipCollaborationInit = // @ts-expect-error split view has right and let frames
	window.parent != null && window.parent.frames.right === window;

	let placeholderText = $.derived(() => $settings().isCollab
		? 'Enter some collaborative rich text...'
		: $settings().isRichText
			? 'Enter some rich text...'
			: 'Enter some plain text...');

	let isSmallWidthViewport = $.state(true);
	let editorDiv = $.state(void 0);

	const initialConfig = {
		editorState: $settings().isCollab
			? null
			: $settings().emptyEditor ? undefined : prepopulatedRichText,
		namespace: 'Playground',
		nodes: [
			HeadingNode,
			ListNode,
			ListItemNode,
			QuoteNode,
			HorizontalRuleNode,
			ImageNode,
			KeywordNode,
			HashtagNode,
			AutoLinkNode,
			LinkNode,
			CodeNode,
			CodeHighlightNode,
			LayoutContainerNode,
			LayoutItemNode,
			TableNode,
			TableCellNode,
			TableRowNode,
			YouTubeNode,
			TweetNode,
			BlueskyNode
		],

		onError: (error) => {
			throw error;
		},
		theme: PlaygroundEditorTheme
	};

	onMount(() => {
		function updateViewPortWidth() {
			const isNextSmallWidthViewport = CAN_USE_DOM && window.matchMedia('(max-width: 1025px)').matches;

			if (isNextSmallWidthViewport !== $.get(isSmallWidthViewport)) {
				$.set(isSmallWidthViewport, isNextSmallWidthViewport, true);
			}
		}

		updateViewPortWidth();
		window.addEventListener('resize', updateViewPortWidth);

		return () => {
			window.removeEventListener('resize', updateViewPortWidth);
		};
	});

	Composer($$anchor, {
		get initialConfig() {
			return initialConfig;
		},

		children: ($$anchor, $$slotProps) => {
			var div = root_2();
			var node = $.child(div);

			{
				var consequent = ($$anchor) => {
					ToolbarPlayground($$anchor, {});
				};

				$.if(node, ($$render) => {
					if ($settings().isRichText) $$render(consequent);
				});
			}

			var div_1 = $.sibling(node, 2);
			var div_2 = $.child(div_1);
			var div_3 = $.child(div_2);
			var node_1 = $.child(div_3);

			ContentEditable(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			PlaceHolder(node_2, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text();

					$.template_effect(() => $.set_text(text, $.get(placeholderText)));
					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.reset(div_3);
			$.bind_this(div_3, ($$value) => $.set(editorDiv, $$value), () => $.get(editorDiv));
			$.reset(div_2);

			var node_3 = $.sibling(div_2, 2);

			AutoFocusPlugin(node_3, {});

			var node_4 = $.sibling(node_3, 2);

			KeywordPlugin(node_4, { keywordsRegex });

			var node_5 = $.sibling(node_4, 2);

			HashtagPlugin(node_5, {});

			var node_6 = $.sibling(node_5, 2);

			AutoLinkPlugin(node_6, {});

			var node_7 = $.sibling(node_6, 2);

			ColumnLayoutPlugin(node_7, {});

			var node_8 = $.sibling(node_7, 2);

			{
				var consequent_5 = ($$anchor) => {
					var fragment_3 = root_1();
					var node_9 = $.first_child(fragment_3);

					RichTextPlugin(node_9, {});

					var node_10 = $.sibling(node_9, 2);

					{
						var consequent_1 = ($$anchor) => {
							{
								let $0 = $.derived(() => !skipCollaborationInit);

								CollaborationPlugin($$anchor, {
									id: 'main',
									get providerFactory() {
										return createWebsocketProvider;
									},

									get shouldBootstrap() {
										return $.get($0);
									}
								});
							}
						};

						var alternate = ($$anchor) => {
							SharedHistoryPlugin($$anchor, {});
						};

						$.if(node_10, ($$render) => {
							if ($settings().isCollab) $$render(consequent_1); else $$render(alternate, -1);
						});
					}

					var node_11 = $.sibling(node_10, 2);

					ListPlugin(node_11, {});

					var node_12 = $.sibling(node_11, 2);

					CheckListPlugin(node_12, {});

					var node_13 = $.sibling(node_12, 2);

					HorizontalRulePlugin(node_13, {});

					var node_14 = $.sibling(node_13, 2);

					ImagePlugin(node_14, {
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = $.comment();
							var node_15 = $.first_child(fragment_6);

							{
								var consequent_2 = ($$anchor) => {
									CaptionEditorCollaborationPlugin($$anchor, {
										get providerFactory() {
											return createWebsocketProvider;
										}
									});
								};

								var alternate_1 = ($$anchor) => {
									CaptionEditorHistoryPlugin($$anchor, {});
								};

								$.if(node_15, ($$render) => {
									if ($settings().isCollab) $$render(consequent_2); else $$render(alternate_1, -1);
								});
							}

							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});

					var node_16 = $.sibling(node_14, 2);

					LinkPlugin(node_16, {
						get validateUrl() {
							return validateUrl;
						}
					});

					var node_17 = $.sibling(node_16, 2);

					{
						var consequent_3 = ($$anchor) => {
							CodeHighlightPrismPlugin($$anchor, {});
						};

						$.if(node_17, ($$render) => {
							if ($settings().isCodeHighlighted) $$render(consequent_3);
						});
					}

					var node_18 = $.sibling(node_17, 2);

					MarkdownShortcutPlugin(node_18, {
						get transformers() {
							return ALL_TRANSFORMERS;
						}
					});

					var node_19 = $.sibling(node_18, 2);

					TablePlugin(node_19, {
						get hasHorizontalScroll() {
							return $settings().tableHorizontalScroll;
						}
					});

					var node_20 = $.sibling(node_19, 2);

					TableHoverActionPlugin(node_20, {
						get anchorElem() {
							return $.get(editorDiv);
						}
					});

					var node_21 = $.sibling(node_20, 2);

					TableCellResizerPlugin(node_21, {});

					var node_22 = $.sibling(node_21, 2);

					TableActionMenuPlugin(node_22, {
						get anchorElem() {
							return $.get(editorDiv);
						},
						cellMerge: true
					});

					var node_23 = $.sibling(node_22, 2);

					YoutubePlugin(node_23, {});

					var node_24 = $.sibling(node_23, 2);

					TwitterPlugin(node_24, {});

					var node_25 = $.sibling(node_24, 2);

					BlueskyPlugin(node_25, {});

					var node_26 = $.sibling(node_25, 2);

					TabIndentationPlugin(node_26, {});

					var node_27 = $.sibling(node_26, 2);

					{
						var consequent_4 = ($$anchor) => {
							var fragment_10 = root();
							var node_28 = $.first_child(fragment_10);

							FloatingLinkEditorPlugin(node_28, {
								get anchorElem() {
									return $.get(editorDiv);
								}
							});

							var node_29 = $.sibling(node_28, 2);

							CodeActionMenuPlugin(node_29, {
								get anchorElem() {
									return $.get(editorDiv);
								}
							});

							$.append($$anchor, fragment_10);
						};

						$.if(node_27, ($$render) => {
							if (!$.get(isSmallWidthViewport)) $$render(consequent_4);
						});
					}

					$.append($$anchor, fragment_3);
				};

				var alternate_2 = ($$anchor) => {
					var fragment_11 = root();
					var node_30 = $.first_child(fragment_11);

					PlainTextPlugin(node_30, {});

					var node_31 = $.sibling(node_30, 2);

					SharedHistoryPlugin(node_31, {});
					$.append($$anchor, fragment_11);
				};

				$.if(node_8, ($$render) => {
					if ($settings().isRichText) $$render(consequent_5); else $$render(alternate_2, -1);
				});
			}

			var node_32 = $.sibling(node_8, 2);

			ComponentPickerMenuPlugin(node_32, {});

			var node_33 = $.sibling(node_32, 2);

			ActionBar(node_33, {});
			$.reset(div_1);

			var node_34 = $.sibling(div_1, 2);

			{
				var consequent_6 = ($$anchor) => {
					TreeViewPlugin($$anchor, {});
				};

				$.if(node_34, ($$render) => {
					if ($settings().showTreeView) $$render(consequent_6);
				});
			}

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.pop();
	$$cleanup();
}
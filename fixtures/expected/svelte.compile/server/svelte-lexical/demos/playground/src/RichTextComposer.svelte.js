import * as $ from 'svelte/internal/server';
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

import { CodeHighlightShikiPlugin } from 'svelte-lexical/shiki';
import { prepopulatedRichText } from './prepopulatedRichText';
import PlaygroundEditorTheme from './themes/PlaygroundEditorTheme';
import ToolbarPlayground from './ToolbarPlayground.svelte';
import { createWebsocketProvider } from './collaboration';

export default function RichTextComposer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const keywordsRegex = /(^|$|[^A-Za-zªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮͰ-ʹͶͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԧԱ-Ֆՙա-ևא-תװ-ײؠ-يٮٯٱ-ۓەۥۦۮۯۺ-ۼۿܐܒ-ܯݍ-ޥޱߊ-ߪߴߵߺࠀ-ࠕࠚࠤࠨࡀ-ࡘࢠࢢ-ࢬऄ-हऽॐक़-ॡॱ-ॷॹ-ॿঅ-ঌএঐও-নপ-রলশ-হঽৎড়ঢ়য়-ৡৰৱਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹਖ਼-ੜਫ਼ੲ-ੴઅ-ઍએ-ઑઓ-નપ-રલળવ-હઽૐૠૡଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହଽଡ଼ଢ଼ୟ-ୡୱஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹௐఅ-ఌఎ-ఐఒ-నప-ళవ-హఽౘౙౠౡಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹಽೞೠೡೱೲഅ-ഌഎ-ഐഒ-ഺഽൎൠൡൺ-ൿඅ-ඖක-නඳ-රලව-ෆก-ะาำเ-ๆກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ະາຳຽເ-ໄໆໜ-ໟༀཀ-ཇཉ-ཬྈ-ྌက-ဪဿၐ-ၕၚ-ၝၡၥၦၮ-ၰၵ-ႁႎႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚᎀ-ᎏᎠ-Ᏼᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᜀ-ᜌᜎ-ᜑᜠ-ᜱᝀ-ᝑᝠ-ᝬᝮ-ᝰក-ឳៗៜᠠ-ᡷᢀ-ᢨᢪᢰ-ᣵᤀ-ᤜᥐ-ᥭᥰ-ᥴᦀ-ᦫᧁ-ᧇᨀ-ᨖᨠ-ᩔᪧᬅ-ᬳᭅ-ᭋᮃ-ᮠᮮᮯᮺ-ᯥᰀ-ᰣᱍ-ᱏᱚ-ᱽᳩ-ᳬᳮ-ᳱᳵᳶᴀ-ᶿḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿₐ-ₜℂℇℊ-ℓℕℙ-ℝℤΩℨK-ℭℯ-ℹℼ-ℿⅅ-ⅉⅎↃↄⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳮⳲⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞⸯ々〆〱-〵〻〼ぁ-ゖゝ-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿌ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘟꘪꘫꙀ-ꙮꙿ-ꚗꚠ-ꛥꜗ-ꜟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꠁꠃ-ꠅꠇ-ꠊꠌ-ꠢꡀ-ꡳꢂ-ꢳꣲ-ꣷꣻꤊ-ꤥꤰ-ꥆꥠ-ꥼꦄ-ꦲꧏꨀ-ꨨꩀ-ꩂꩄ-ꩋꩠ-ꩶꩺꪀ-ꪯꪱꪵꪶꪹ-ꪽꫀꫂꫛ-ꫝꫠ-ꫪꫲ-ꫴꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꯀ-ꯢ가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִײַ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼＡ-Ｚａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ])(congrats|congratulations|gratuluju|gratuluji|gratulujeme|blahopřeju|blahopřeji|blahopřejeme|Til lykke|Tillykke|Glückwunsch|Gratuliere|felicitaciones|enhorabuena|paljon onnea|onnittelut|Félicitations|gratula|gratulálok|gratulálunk|congratulazioni|complimenti|おめでとう|おめでとうございます|축하해|축하해요|gratulerer|Gefeliciteerd|gratulacje|Parabéns|parabéns|felicitações|felicitări|мои поздравления|поздравляем|поздравляю|gratulujem|blahoželám|ยินดีด้วย|ขอแสดงความยินดี|tebrikler|tebrik ederim|恭喜|祝贺你|恭喜你|恭喜|恭喜|baie geluk|veels geluk|অভিনন্দন|Čestitam|Čestitke|Čestitamo|Συγχαρητήρια|Μπράβο|અભિનંદન|badhai|बधाई|अभिनंदन|Честитам|Свака част|hongera|வாழ்த்துகள்|வாழ்த்துக்கள்|అభినందనలు|അഭിനന്ദനങ്ങൾ|Chúc mừng|מזל טוב|mazel tov|mazal tov)(^|$|[^A-Za-zªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮͰ-ʹͶͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԧԱ-Ֆՙա-ևא-תװ-ײؠ-يٮٯٱ-ۓەۥۦۮۯۺ-ۼۿܐܒ-ܯݍ-ޥޱߊ-ߪߴߵߺࠀ-ࠕࠚࠤࠨࡀ-ࡘࢠࢢ-ࢬऄ-हऽॐक़-ॡॱ-ॷॹ-ॿঅ-ঌএঐও-নপ-রলশ-হঽৎড়ঢ়য়-ৡৰৱਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹਖ਼-ੜਫ਼ੲ-ੴઅ-ઍએ-ઑઓ-નપ-રલળવ-હઽૐૠૡଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହଽଡ଼ଢ଼ୟ-ୡୱஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹௐఅ-ఌఎ-ఐఒ-నప-ళవ-హఽౘౙౠౡಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹಽೞೠೡೱೲഅ-ഌഎ-ഐഒ-ഺഽൎൠൡൺ-ൿඅ-ඖක-නඳ-රලව-ෆก-ะาำเ-ๆກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ະາຳຽເ-ໄໆໜ-ໟༀཀ-ཇཉ-ཬྈ-ྌက-ဪဿၐ-ၕၚ-ၝၡၥၦၮ-ၰၵ-ႁႎႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚᎀ-ᎏᎠ-Ᏼᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᜀ-ᜌᜎ-ᜑᜠ-ᜱᝀ-ᝑᝠ-ᝬᝮ-ᝰក-ឳៗៜᠠ-ᡷᢀ-ᢨᢪᢰ-ᣵᤀ-ᤜᥐ-ᥭᥰ-ᥴᦀ-ᦫᧁ-ᧇᨀ-ᨖᨠ-ᩔᪧᬅ-ᬳᭅ-ᭋᮃ-ᮠᮮᮯᮺ-ᯥᰀ-ᰣᱍ-ᱏᱚ-ᱽᳩ-ᳬᳮ-ᳱᳵᳶᴀ-ᶿḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿₐ-ₜℂℇℊ-ℓℕℙ-ℝℤΩℨK-ℭℯ-ℹℼ-ℿⅅ-ⅉⅎↃↄⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳮⳲⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞⸯ々〆〱-〵〻〼ぁ-ゖゝ-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿌ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘟꘪꘫꙀ-ꙮꙿ-ꚗꚠ-ꛥꜗ-ꜟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꠁꠃ-ꠅꠇ-ꠊꠌ-ꠢꡀ-ꡳꢂ-ꢳꣲ-ꣷꣻꤊ-ꤥꤰ-ꥆꥠ-ꥼꦄ-ꦲꧏꨀ-ꨨꩀ-ꩂꩄ-ꩋꩠ-ꩶꩺꪀ-ꪯꪱꪵꪶꪹ-ꪽꫀꫂꫛ-ꫝꫠ-ꫪꫲ-ꫴꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꯀ-ꯢ가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִײַ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼＡ-Ｚａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ])/i;
		const settings = getContext('settings');

		const skipCollaborationInit = // @ts-expect-error split view has right and let frames
		window.parent != null && window.parent.frames.right === window;

		let placeholderText = $.derived(() => $.store_get($$store_subs ??= {}, '$settings', settings).isCollab
			? 'Enter some collaborative rich text...'
			: $.store_get($$store_subs ??= {}, '$settings', settings).isRichText
				? 'Enter some rich text...'
				: 'Enter some plain text...');

		let isSmallWidthViewport = true;
		let editorDiv = void 0;

		const initialConfig = {
			editorState: $.store_get($$store_subs ??= {}, '$settings', settings).isCollab
				? null
				: $.store_get($$store_subs ??= {}, '$settings', settings).emptyEditor ? undefined : prepopulatedRichText,
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

				if (isNextSmallWidthViewport !== isSmallWidthViewport) {
					isSmallWidthViewport = isNextSmallWidthViewport;
				}
			}

			updateViewPortWidth();
			window.addEventListener('resize', updateViewPortWidth);

			return () => {
				window.removeEventListener('resize', updateViewPortWidth);
			};
		});

		Composer($$renderer, {
			initialConfig,
			children: ($$renderer) => {
				$$renderer.push(`<div class="editor-shell">`);

				if ($.store_get($$store_subs ??= {}, '$settings', settings).isRichText) {
					$$renderer.push('<!--[0-->');
					ToolbarPlayground($$renderer, {});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <div class="editor-container tree-view"><div class="editor-scroller"><div class="editor">`);
				ContentEditable($$renderer, {});
				$$renderer.push(`<!----> `);

				PlaceHolder($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(placeholderText())}`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div></div> `);
				AutoFocusPlugin($$renderer, {});
				$$renderer.push(`<!----> `);
				KeywordPlugin($$renderer, { keywordsRegex });
				$$renderer.push(`<!----> `);
				HashtagPlugin($$renderer, {});
				$$renderer.push(`<!----> `);
				AutoLinkPlugin($$renderer, {});
				$$renderer.push(`<!----> `);
				ColumnLayoutPlugin($$renderer, {});
				$$renderer.push(`<!----> `);

				if ($.store_get($$store_subs ??= {}, '$settings', settings).isRichText) {
					$$renderer.push('<!--[0-->');
					RichTextPlugin($$renderer, {});
					$$renderer.push(`<!----> `);

					if ($.store_get($$store_subs ??= {}, '$settings', settings).isCollab) {
						$$renderer.push('<!--[0-->');

						CollaborationPlugin($$renderer, {
							id: 'main',
							providerFactory: createWebsocketProvider,
							shouldBootstrap: !skipCollaborationInit
						});
					} else {
						$$renderer.push('<!--[-1-->');
						SharedHistoryPlugin($$renderer, {});
					}

					$$renderer.push(`<!--]--> `);
					ListPlugin($$renderer, {});
					$$renderer.push(`<!----> `);
					CheckListPlugin($$renderer, {});
					$$renderer.push(`<!----> `);
					HorizontalRulePlugin($$renderer, {});
					$$renderer.push(`<!----> `);

					ImagePlugin($$renderer, {
						children: ($$renderer) => {
							if ($.store_get($$store_subs ??= {}, '$settings', settings).isCollab) {
								$$renderer.push('<!--[0-->');
								CaptionEditorCollaborationPlugin($$renderer, { providerFactory: createWebsocketProvider });
							} else {
								$$renderer.push('<!--[-1-->');
								CaptionEditorHistoryPlugin($$renderer, {});
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);
					LinkPlugin($$renderer, { validateUrl });
					$$renderer.push(`<!----> `);

					if ($.store_get($$store_subs ??= {}, '$settings', settings).isCodeHighlighted) {
						$$renderer.push('<!--[0-->');

						if ($.store_get($$store_subs ??= {}, '$settings', settings).isCodeShiki) {
							$$renderer.push('<!--[0-->');
							CodeHighlightShikiPlugin($$renderer, {});
						} else {
							$$renderer.push('<!--[-1-->');
							CodeHighlightPrismPlugin($$renderer, {});
						}

						$$renderer.push(`<!--]-->`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);
					MarkdownShortcutPlugin($$renderer, { transformers: ALL_TRANSFORMERS });
					$$renderer.push(`<!----> `);

					TablePlugin($$renderer, {
						hasHorizontalScroll: $.store_get($$store_subs ??= {}, '$settings', settings).tableHorizontalScroll
					});

					$$renderer.push(`<!----> `);
					TableHoverActionPlugin($$renderer, { anchorElem: editorDiv });
					$$renderer.push(`<!----> `);
					TableCellResizerPlugin($$renderer, {});
					$$renderer.push(`<!----> `);
					TableActionMenuPlugin($$renderer, { anchorElem: editorDiv, cellMerge: true });
					$$renderer.push(`<!----> `);
					YoutubePlugin($$renderer, {});
					$$renderer.push(`<!----> `);
					TwitterPlugin($$renderer, {});
					$$renderer.push(`<!----> `);
					BlueskyPlugin($$renderer, {});
					$$renderer.push(`<!----> `);
					TabIndentationPlugin($$renderer, {});
					$$renderer.push(`<!----> `);

					if (!isSmallWidthViewport) {
						$$renderer.push('<!--[0-->');
						FloatingLinkEditorPlugin($$renderer, { anchorElem: editorDiv });
						$$renderer.push(`<!----> `);
						CodeActionMenuPlugin($$renderer, { anchorElem: editorDiv });
						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				} else {
					$$renderer.push('<!--[-1-->');
					PlainTextPlugin($$renderer, {});
					$$renderer.push(`<!----> `);
					SharedHistoryPlugin($$renderer, {});
					$$renderer.push(`<!---->`);
				}

				$$renderer.push(`<!--]--> `);
				ComponentPickerMenuPlugin($$renderer, {});
				$$renderer.push(`<!----> `);
				ActionBar($$renderer, {});
				$$renderer.push(`<!----></div> `);

				if ($.store_get($$store_subs ??= {}, '$settings', settings).showTreeView) {
					$$renderer.push('<!--[0-->');
					TreeViewPlugin($$renderer, {});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			},
			$$slots: { default: true }
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}
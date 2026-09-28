import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import BlockWithAlignableContents from '../BlockWithAlignableContents.svelte';

var root = $.from_html(`<!> <div style="display: inline-block; width: 550px"></div>`, 1);

export default function TweetComponent($$anchor, $$props) {
	$.push($$props, true);

	let isTwitterScriptLoading = true;
	const WIDGET_SCRIPT_URL = 'https://platform.twitter.com/widgets.js';
	let containerRef = null;
	let previousTweetIDRef = '';
	let isTweetLoading = $.state(false);

	const createTweet = async () => {
		try {
			// @ts-expect-error Twitter is attached to the window.
			await window.twttr.widgets.createTweet($$props.tweetID, containerRef);

			$.set(isTweetLoading, false);
			isTwitterScriptLoading = false;

			if ($$props.onLoad) {
				$$props.onLoad();
			}
		} catch(error) {
			if ($$props.onError) {
				$$props.onError(String(error));
			}
		}
	};

	$.user_effect(() => {
		if ($$props.tweetID !== previousTweetIDRef) {
			$.set(isTweetLoading, true);

			if (isTwitterScriptLoading) {
				const script = document.createElement('script');

				script.src = WIDGET_SCRIPT_URL;
				script.async = true;
				document.body?.appendChild(script);
				script.onload = createTweet;

				if ($$props.onError) {
					script.onerror = (e) => $$props.onError(String(e));
				}
			} else {
				createTweet();
			}

			if (previousTweetIDRef) {
				previousTweetIDRef = $$props.tweetID;
			}
		}
	});

	BlockWithAlignableContents($$anchor, {
		get className() {
			return $$props.className;
		},

		get format() {
			return $$props.format;
		},

		get nodeKey() {
			return $$props.nodeKey;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var text = $.text();

					$.template_effect(() => $.set_text(text, $$props.loadingComponent));
					$.append($$anchor, text);
				};

				$.if(node, ($$render) => {
					if ($.get(isTweetLoading)) $$render(consequent);
				});
			}

			var div = $.sibling(node, 2);

			$.bind_this(div, ($$value) => containerRef = $$value, () => containerRef);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}
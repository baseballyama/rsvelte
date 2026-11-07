import * as $ from 'svelte/internal/server';
import BlockWithAlignableContents from '../BlockWithAlignableContents.svelte';

export default function TweetComponent($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let isTwitterScriptLoading = true;
		const WIDGET_SCRIPT_URL = 'https://platform.twitter.com/widgets.js';

		let {
			className,
			format,
			loadingComponent,
			nodeKey,
			onError,
			onLoad,
			tweetID
		} = $$props;

		let containerRef = null;
		let previousTweetIDRef = '';
		let isTweetLoading = false;

		const createTweet = async () => {
			try {
				// @ts-expect-error Twitter is attached to the window.
				await window.twttr.widgets.createTweet(tweetID, containerRef);

				isTweetLoading = false;
				isTwitterScriptLoading = false;

				if (onLoad) {
					onLoad();
				}
			} catch(error) {
				if (onError) {
					onError(String(error));
				}
			}
		};

		BlockWithAlignableContents($$renderer, {
			className,
			format,
			nodeKey,
			children: ($$renderer) => {
				if (isTweetLoading) {
					$$renderer.push(`<!--[0-->${$.escape(loadingComponent)}`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <div style="display: inline-block; width: 550px"></div>`);
			},
			$$slots: { default: true }
		});
	});
}
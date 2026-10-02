import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Header from '$lib/ui/header/header.svelte';
import Footer from '$lib/ui/footer.svelte';
import LiteYouTubeEmbed from '$lib/embed/youtube.svelte';
import { useAnalytics } from '$lib/analytics';
import { setupViewTransition } from '$lib/utils';
import '../styles/styles.css';

var root = $.from_html(`<!> <div class="container svelte-12qhfyh"><!> <div class="layout svelte-12qhfyh"><!> <!></div></div>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);
	useAnalytics();
	setupViewTransition();

	var fragment = root();
	var node = $.first_child(fragment);

	LiteYouTubeEmbed(node, {});

	var div = $.sibling(node, 2);
	var node_1 = $.child(div);

	Header(node_1, {});

	var div_1 = $.sibling(node_1, 2);
	var node_2 = $.child(div_1);

	$.snippet(node_2, () => $$props.children ?? $.noop);

	var node_3 = $.sibling(node_2, 2);

	Footer(node_3, {});
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, fragment);
	$.pop();
}
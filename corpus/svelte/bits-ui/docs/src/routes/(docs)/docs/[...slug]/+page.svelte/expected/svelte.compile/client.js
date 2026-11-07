import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import "$lib/styles/markdown.css";
import DocPage from "$lib/components/doc-page.svelte";

export default function _page($$anchor, $$props) {
	DocPage($$anchor, $.spread_props(() => $$props.data));
}
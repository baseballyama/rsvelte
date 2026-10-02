import * as $ from 'svelte/internal/server';
import "$lib/styles/markdown.css";
import DocPage from "$lib/components/doc-page.svelte";

export default function _page($$renderer, $$props) {
	let { data } = $$props;

	DocPage($$renderer, $.spread_props([data]));
}
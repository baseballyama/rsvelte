import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/stores';
import '../../styles/page-specific/about-page.scss';

var root = $.from_html(`<main><!></main>`);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	const $page = () => $.store_get(page, '$page', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const isLicensePage = $.derived(() => ($page().url?.pathname ?? '/').includes('/license'));
	var main = root();
	let classes;
	var node = $.child(main);

	$.snippet(node, () => $$props.children);
	$.reset(main);
	$.template_effect(() => classes = $.set_class(main, 1, 'card about-content svelte-3yd7a3', null, classes, { 'license-page': $.get(isLicensePage) }));
	$.append($$anchor, main);
	$.pop();
	$$cleanup();
}
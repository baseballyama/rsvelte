import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from "$app/stores";
import { googleTag } from "./analytics.js";

var root = $.from_html(`<link rel="preconnect" crossorigin="anonymous" href="https://www.googletagmanager.com/gtag/js?id=G-8TYYNBE4EE"/>`);

export default function Analytics($$anchor, $$props) {
	$.push($$props, true);

	const $page = () => $.store_get(page, '$page', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	$.user_effect(() => {
		const pageViewEventParameters = {
			page_title: document.title,
			page_path: $page().url.pathname,
			value: "page_view"
		};

		googleTag("event", "page_view", pageViewEventParameters);

		// <!-- Global site tag (gtag.js) - Google Analytics -->
		// console.log("loading... Global site tag")
		const script = document.createElement("script");

		script.src = "https://www.googletagmanager.com/gtag/js?id=G-8TYYNBE4EE";
		script.async = true;

		// var n = window["__nonce"]
		// n && script.setAttribute("nonce", n)
		document.head.appendChild(script);
	});

	var fragment = $.comment();

	$.head('1ig02kh', ($$anchor) => {
		var link = root();

		$.append($$anchor, link);
	});

	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.children);
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}
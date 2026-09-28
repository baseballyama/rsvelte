import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from "$app/state";
import { Pagination } from "flowbite-svelte";
import { onMount } from "svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Default2($$anchor, $$props) {
	$.push($$props, true);

	let isMobile = $.state(false);
	let activeUrl = $.derived(() => page.url.searchParams.get("page"));

	let pages = $.state($.proxy([
		{
			name: "1",
			href: "/docs/components/pagination?page=1",
			active: false
		},

		{
			name: "2",
			href: "/docs/components/pagination?page=2",
			active: false
		},

		{
			name: "3",
			href: "/docs/components/pagination?page=3",
			active: false
		},

		{
			name: "4",
			href: "/docs/components/pagination?page=4",
			active: false
		},

		{
			name: "5",
			href: "/docs/components/pagination?page=5",
			active: false
		}
	]));

	$.user_effect(() => {
		$.get(pages).forEach((page) => {
			let splitUrl = page.href?.split("?");
			let queryString = splitUrl?.slice(1).join("?");
			const hrefParams = new URLSearchParams(queryString);
			let hrefValue = hrefParams.get("page");

			if (hrefValue === $.get(activeUrl)) {
				page.active = true;
			} else {
				page.active = false;
			}
		});

		$.set(pages, $.get(pages), true);
	});

	const previous = () => {
		alert("Previous btn clicked. Make a call to your server to fetch data.");
	};

	const next = () => {
		alert("Next btn clicked. Make a call to your server to fetch data.");
	};

	function checkMobile() {
		$.set(isMobile, window.innerWidth <= 640);
	}

	onMount(() => {
		checkMobile();
		window.addEventListener("resize", checkMobile);

		return () => window.removeEventListener("resize", checkMobile);
	});

	var fragment = root();
	var node = $.first_child(fragment);

	Pagination(node, {
		get pages() {
			return $.get(pages);
		},
		previous,
		next
	});

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			Pagination($$anchor, {
				get pages() {
					return $.get(pages);
				},
				size: 'large',
				previous,
				next
			});
		};

		$.if(node_1, ($$render) => {
			if (!$.get(isMobile)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}
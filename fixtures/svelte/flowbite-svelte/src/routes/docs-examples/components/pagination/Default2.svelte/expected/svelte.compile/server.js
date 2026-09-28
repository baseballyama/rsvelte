import * as $ from 'svelte/internal/server';
import { page } from "$app/state";
import { Pagination } from "flowbite-svelte";
import { onMount } from "svelte";

export default function Default2($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let isMobile = false;
		let activeUrl = $.derived(() => page.url.searchParams.get("page"));

		let pages = [
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
		];

		const previous = () => {
			alert("Previous btn clicked. Make a call to your server to fetch data.");
		};

		const next = () => {
			alert("Next btn clicked. Make a call to your server to fetch data.");
		};

		function checkMobile() {
			isMobile = window.innerWidth <= 640;
		}

		onMount(() => {
			checkMobile();
			window.addEventListener("resize", checkMobile);

			return () => window.removeEventListener("resize", checkMobile);
		});

		Pagination($$renderer, { pages, previous, next });
		$$renderer.push(`<!----> `);

		if (!isMobile) {
			$$renderer.push('<!--[0-->');
			Pagination($$renderer, { pages, size: 'large', previous, next });
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}
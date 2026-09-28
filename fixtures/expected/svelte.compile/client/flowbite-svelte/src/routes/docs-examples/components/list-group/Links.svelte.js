import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Listgroup } from "flowbite-svelte";

export default function Links($$anchor) {
	let links = [
		{
			name: "Accordions",
			href: "/docs/components/accordion",
			current: true
		},
		{ name: "Alerts", href: "/docs/components/alert" },
		{ name: "Badges", href: "/docs/components/badge" },
		{
			name: "Breadcrumbs",
			href: "/docs/components/breadcrumb",
			attrs: { target: "_blank" }
		}
	];

	Listgroup($$anchor, {
		active: true,
		get items() {
			return links;
		},
		class: 'w-48'
	});
}
import * as $ from 'svelte/internal/server';
import { Listgroup } from "flowbite-svelte";

export default function Links($$renderer) {
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

	Listgroup($$renderer, { active: true, items: links, class: 'w-48' });
}
import * as $ from 'svelte/internal/server';
import { DataTable } from "carbon-components-svelte";

export default function StickyHeaderMaxHeight($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const rows = Array.from({ length: 20 }).map((_, i) => ({
			id: i,
			name: `Load Balancer ${i + 1}`,
			protocol: "HTTP",
			port: i % 3 ? i % 2 ? 3000 : 80 : 443,
			rule: i % 3 ? "Round robin" : "DNS delegation"
		}));

		DataTable($$renderer, {
			title: 'Load balancers',
			description: 'Your organization\'s active load balancers.',
			stickyHeader: true,
			stickyHeaderMaxHeight: 500,
			headers: [
				{ key: "name", value: "Name" },
				{ key: "protocol", value: "Protocol" },
				{ key: "port", value: "Port" },
				{ key: "rule", value: "Rule" }
			],
			rows
		});
	});
}
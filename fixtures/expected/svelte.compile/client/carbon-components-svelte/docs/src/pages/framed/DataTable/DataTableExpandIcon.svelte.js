import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DataTable } from "carbon-components-svelte";
import Add from "carbon-icons-svelte/lib/Add.svelte";

var root = $.from_html(`<pre> </pre>`);

export default function DataTableExpandIcon($$anchor) {
	DataTable($$anchor, {
		expandable: true,
		headers: [
			{ key: "name", value: "Name" },
			{ key: "protocol", value: "Protocol" },
			{ key: "port", value: "Port" },
			{ key: "rule", value: "Rule" }
		],
		rows: [
			{
				id: "a",
				name: "Load Balancer 3",
				protocol: "HTTP",
				port: 3000,
				rule: "Round robin"
			},

			{
				id: "b",
				name: "Load Balancer 1",
				protocol: "HTTP",
				port: 443,
				rule: "Round robin"
			},

			{
				id: "c",
				name: "Load Balancer 2",
				protocol: "HTTP",
				port: 80,
				rule: "DNS delegation"
			},

			{
				id: "d",
				name: "Load Balancer 6",
				protocol: "HTTP",
				port: 3000,
				rule: "Round robin"
			},

			{
				id: "e",
				name: "Load Balancer 4",
				protocol: "HTTP",
				port: 443,
				rule: "Round robin"
			},

			{
				id: "f",
				name: "Load Balancer 5",
				protocol: "HTTP",
				port: 80,
				rule: "DNS delegation"
			}
		],
		$$slots: {
			expandIcon: ($$anchor, $$slotProps) => {
				const expanded = $.derived(() => $$slotProps.expanded);
				const props = $.derived(() => $$slotProps.props);

				{
					let $0 = $.derived(() => $.get(expanded) ? 'rotate(45deg)' : 'rotate(0deg)');

					Add($$anchor, $.spread_props(() => $.get(props), {
						get style() {
							return `display: inline-block; transition: transform 0.2s ease; transform: ${$.get($0) ?? ''}`;
						}
					}));
				}
			},

			expandedRow: ($$anchor, $$slotProps) => {
				const row = $.derived(() => $$slotProps.row);
				var pre = root();
				var text = $.only_child(pre, true);

				$.template_effect(($0) => $.set_text(text, $0), [() => JSON.stringify($.get(row), null, 2)]);
				$.append($$anchor, pre);
			}
		}
	});
}
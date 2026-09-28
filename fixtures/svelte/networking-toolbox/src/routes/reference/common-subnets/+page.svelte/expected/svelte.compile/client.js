import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Tooltip from '$lib/components/global/Tooltip.svelte';
import { COMMON_SUBNETS } from '$lib/constants/networks.js';

var root = $.from_html(`<div class="table-row svelte-1ucf1rp"><span class="cidr-cell svelte-1ucf1rp"> </span> <span class="mask-cell svelte-1ucf1rp"> </span> <span class="hosts-cell svelte-1ucf1rp"> </span> <span class="usage-cell svelte-1ucf1rp"><!></span></div>`);
var root_1 = $.from_html(`<div class="card"><header class="card-header"><h2>Common Subnets</h2> <p>Frequently used CIDR prefixes with masks, host counts, and typical usage.</p></header> <div class="subnets-table fade-in svelte-1ucf1rp"><div class="table-header svelte-1ucf1rp"><span class="svelte-1ucf1rp">CIDR</span> <span class="svelte-1ucf1rp">Subnet Mask</span> <span class="svelte-1ucf1rp">Hosts</span> <span class="svelte-1ucf1rp">Usage</span></div> <!></div></div>`);

export default function _page($$anchor) {
	var div = root_1();
	var div_1 = $.sibling($.child(div), 2);
	var node = $.sibling($.child(div_1), 2);

	$.each(node, 17, () => COMMON_SUBNETS, (subnet) => `${subnet.cidr}-${subnet.mask}`, ($$anchor, subnet) => {
		{
			let $0 = $.derived(() => `/${$.get(subnet).cidr} with ${$.get(subnet).mask} supports ${$.get(subnet).hosts.toLocaleString()} hosts`);

			Tooltip($$anchor, {
				get text() {
					return $.get($0);
				},
				position: 'top',
				children: ($$anchor, $$slotProps) => {
					var div_2 = root();
					var span = $.child(div_2);
					var text = $.only_child(span);
					var span_1 = $.sibling(span, 2);
					var text_1 = $.only_child(span_1, true);
					var span_2 = $.sibling(span_1, 2);
					var text_2 = $.only_child(span_2, true);
					var span_3 = $.sibling(span_2, 2);
					var node_1 = $.child(span_3);

					{
						var consequent = ($$anchor) => {
							var text_3 = $.text('Large ISPs');

							$.append($$anchor, text_3);
						};

						var consequent_1 = ($$anchor) => {
							var text_4 = $.text('Universities');

							$.append($$anchor, text_4);
						};

						var consequent_2 = ($$anchor) => {
							var text_5 = $.text('Small businesses');

							$.append($$anchor, text_5);
						};

						var consequent_3 = ($$anchor) => {
							var text_6 = $.text('Departments');

							$.append($$anchor, text_6);
						};

						var consequent_4 = ($$anchor) => {
							var text_7 = $.text('Teams');

							$.append($$anchor, text_7);
						};

						var consequent_5 = ($$anchor) => {
							var text_8 = $.text('Small offices');

							$.append($$anchor, text_8);
						};

						var consequent_6 = ($$anchor) => {
							var text_9 = $.text('Workgroups');

							$.append($$anchor, text_9);
						};

						var consequent_7 = ($$anchor) => {
							var text_10 = $.text('Small groups');

							$.append($$anchor, text_10);
						};

						var consequent_8 = ($$anchor) => {
							var text_11 = $.text('Point-to-point');

							$.append($$anchor, text_11);
						};

						var alternate = ($$anchor) => {
							var text_12 = $.text('General use');

							$.append($$anchor, text_12);
						};

						$.if(node_1, ($$render) => {
							if ($.get(subnet).cidr === 8) $$render(consequent); else if ($.get(subnet).cidr === 16) $$render(consequent_1, 1); else if ($.get(subnet).cidr === 24) $$render(consequent_2, 2); else if ($.get(subnet).cidr === 25) $$render(consequent_3, 3); else if ($.get(subnet).cidr === 26) $$render(consequent_4, 4); else if ($.get(subnet).cidr === 27) $$render(consequent_5, 5); else if ($.get(subnet).cidr === 28) $$render(consequent_6, 6); else if ($.get(subnet).cidr === 29) $$render(consequent_7, 7); else if ($.get(subnet).cidr === 30) $$render(consequent_8, 8); else $$render(alternate, -1);
						});
					}

					$.reset(span_3);
					$.reset(div_2);

					$.template_effect(
						($0) => {
							$.set_text(text, `/${$.get(subnet).cidr ?? ''}`);
							$.set_text(text_1, $.get(subnet).mask);
							$.set_text(text_2, $0);
						},
						[() => $.get(subnet).hosts.toLocaleString()]
					);

					$.append($$anchor, div_2);
				},
				$$slots: { default: true }
			});
		}
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}
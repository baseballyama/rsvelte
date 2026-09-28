import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Tab, { Icon, Label } from '@smui/tab';
import TabBar from '@smui/tab-bar';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div><!> <pre class="status"> </pre></div>`);

export default function _KeyedIconsAboveRestrictedIndicatorsFadeTransition($$anchor) {
	let tabs = [
		{ k: 1, icon: 'code', label: 'Code' },
		{ k: 2, icon: 'code', label: 'Code' },
		{ k: 3, icon: 'code', label: 'Code' },
		{ k: 4, icon: 'code', label: 'Code' }
	];

	let active = $.state($.proxy(tabs[2]));
	var div = root_1();
	var node = $.child(div);

	{
		const tab = ($$anchor, tab = $.noop) => {
			Tab($$anchor, {
				get tab() {
					return tab();
				},
				stacked: true,
				indicatorSpanOnlyContent: true,
				tabIndicator$transition: 'fade',
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_1 = $.first_child(fragment_1);

					Icon(node_1, {
						class: 'material-icons',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text();

							$.template_effect(() => $.set_text(text, tab().icon));
							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					Label(node_2, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text();

							$.template_effect(() => $.set_text(text_1, tab().label));
							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		};

		TabBar(node, {
			get tabs() {
				return tabs;
			},
			key: (tab) => tab.k,
			get active() {
				return $.get(active);
			},

			set active($$value) {
				$.set(active, $$value, true);
			},
			tab,
			$$slots: { tab: true }
		});
	}

	var pre = $.sibling(node, 2);
	var text_2 = $.only_child(pre);

	$.reset(div);
	$.template_effect(() => $.set_text(text_2, `Selected: ${$.get(active).k ?? ''}`));
	$.append($$anchor, div);
}
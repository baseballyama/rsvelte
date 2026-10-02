import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { afterNavigate } from '$app/navigation';
import ShowCard from '$lib/ShowCard.svelte';
import { theme_maker } from '$state/theme';
import { onMount } from 'svelte';

var root = $.from_html(`<h3>Grid With Cards</h3> <div class="grid"><!> <!><!><!></div>`, 1);

var root_1 = $.from_html(
	`<div class="zone"><h3>Normal Zone</h3> <p>By default zones don't have any padding, but they do enable easy setting of local --bg and --fg
		variables.</p></div> <div class="zone"><h3>Inverse Zone</h3> <p>By default zones don't have any padding, but they do enable easy setting of local --bg and --fg
		variables.</p></div> <div class="zone"><h3>Always Dark Zone</h3> <p>By default zones don't have any padding, but they do enable easy setting of local --bg and --fg
		variables.</p></div> <div class="zone"><h3>Zone With Accent</h3> <p>A zone with accents is just a zone with custom style, --bg, --radius, --border values. This
		utilizes the --bg-1 variable to control accents in themes.</p></div> <!>`,
	1
);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const { show } = $$props.data;

	onMount(() => {
		theme_maker.open();
	});

	afterNavigate(() => {
		theme_maker.open();
	});

	var fragment = root_1();
	var div = $.sibling($.first_child(fragment), 2);

	$.set_style(div, '', {}, { '--bg': 'var(--fg-sheet)', '--fg': 'var(--bg-sheet)' });

	var div_1 = $.sibling(div, 2);

	$.set_style(div_1, '', {}, { '--bg': 'var(--bg-root)', '--fg': 'var(--fg-root)' });

	var div_2 = $.sibling(div_1, 2);

	$.set_style(div_2, 'border: solid 0.5px var(--black-1)', {}, { '--radius': '20px', '--bg': 'var(--bg-1)' });

	var node = $.sibling(div_2, 2);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = root();
			var div_3 = $.sibling($.first_child(fragment_1), 2);
			var node_1 = $.child(div_3);

			ShowCard(node_1, {
				display: 'highlight',
				get show() {
					return show;
				}
			});

			var node_2 = $.sibling(node_1, 2);

			ShowCard(node_2, {
				get show() {
					return show;
				}
			});

			var node_3 = $.sibling(node_2);

			ShowCard(node_3, {
				get show() {
					return show;
				}
			});

			var node_4 = $.sibling(node_3);

			ShowCard(node_4, {
				get show() {
					return show;
				}
			});

			$.reset(div_3);
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (show?.id) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}
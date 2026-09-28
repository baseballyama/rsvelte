import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto } from '$app/navigation';
import { page } from '$app/state';

var root = $.from_html(`<p></p>`);
var root_1 = $.from_html(`<button id="back-button" type="button">Back</button>`);
var root_2 = $.from_html(`<a id="subpage-link" href="/scroll/push-state/a">Subpage</a> <!> <button id="shallow-button" type="button">Shallow</button> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	function handleClick() {
		goto('', { shallow: true, state: { active: true } });
	}

	var fragment = root_2();
	var node = $.sibling($.first_child(fragment), 2);

	$.each(node, 16, () => ({ length: 20 }), $.index, ($$anchor, _, n) => {
		var p = root();

		p.textContent = `#${n}`;
		$.append($$anchor, p);
	});

	var button = $.sibling(node, 2);
	var node_1 = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			var button_1 = root_1();

			$.delegated('click', button_1, () => history.back());
			$.append($$anchor, button_1);
		};

		$.if(node_1, ($$render) => {
			if (page.state.active) $$render(consequent);
		});
	}

	$.delegated('click', button, handleClick);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { lockscroll } from '@svelte-put/lockscroll';

var root = $.from_html(`<p>What is Lorem Ipsum? Lorem Ipsum is simply dummy text of the printing and typesetting
			industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when
			an unknown printer took a galley of type and scrambled it to make a type specimen book. It has
			survived not only five centuries, but also the leap into electronic typesetting, remaining
			essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets
			containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus
			PageMaker including versions of Lorem Ipsum.</p>`);

var root_1 = $.from_html(`<button class="c-btn mx-auto">Toggle lock scroll for below section</button> <section class="bg-bg-soft mt-4 max-h-[400px] overflow-auto rounded px-6"></section>`, 1);

export default function Scroll_container($$anchor, $$props) {
	$.push($$props, true);

	let locked = $.state(false);
	var fragment = root_1();
	var button = $.first_child(fragment);
	var section = $.sibling(button, 2);

	$.each(section, 20, () => new Array(10), $.index, ($$anchor, _) => {
		var p = root();

		$.append($$anchor, p);
	});

	$.reset(section);
	$.action(section, ($$node, $$action_arg) => lockscroll?.($$node, $$action_arg), () => $.get(locked));
	$.delegated('click', button, () => $.set(locked, !$.get(locked)));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);
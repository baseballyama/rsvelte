import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fork } from 'svelte';
import A from './A.svelte';
import B from './B.svelte';

var root = $.from_html(`<button>fork</button> <button>commit</button> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let open = $.state(true);
	let f;
	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var node = $.sibling(button_1, 2);

	{
		var consequent = ($$anchor) => {
			A($$anchor, {});
		};

		var alternate = ($$anchor) => {
			B($$anchor, {});
		};

		$.if(node, ($$render) => {
			if ($.get(open)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.delegated('click', button, () => {
		f = fork(() => {
			$.set(open, !$.get(open));
		});
	});

	$.delegated('click', button_1, () => {
		f.commit();
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);
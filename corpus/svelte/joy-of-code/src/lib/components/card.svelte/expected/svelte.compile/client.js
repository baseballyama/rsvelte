import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="card danger svelte-1u0xoi6"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon svelte-1u0xoi6"><circle cx="12" cy="12" r="10"></circle><path d="m15 9-6 6"></path><path d="m9 9 6 6"></path></svg> <!></div>`);
var root_1 = $.from_html(`<div class="card info svelte-1u0xoi6"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon svelte-1u0xoi6"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg> <!></div>`);
var root_2 = $.from_html(`<div class="card warning svelte-1u0xoi6"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon svelte-1u0xoi6"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg> <!></div>`);
var root_3 = $.from_html(`<!> <!> <!>`, 1);

export default function Card($$anchor, $$props) {
	var fragment = root_3();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var node_1 = $.sibling($.child(div), 2);

			$.snippet(node_1, () => $$props.children);
			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($$props.type === 'danger') $$render(consequent);
		});
	}

	var node_2 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_1 = root_1();
			var node_3 = $.sibling($.child(div_1), 2);

			$.snippet(node_3, () => $$props.children);
			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		$.if(node_2, ($$render) => {
			if ($$props.type === 'info') $$render(consequent_1);
		});
	}

	var node_4 = $.sibling(node_2, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div_2 = root_2();
			var node_5 = $.sibling($.child(div_2), 2);

			$.snippet(node_5, () => $$props.children);
			$.reset(div_2);
			$.append($$anchor, div_2);
		};

		$.if(node_4, ($$render) => {
			if ($$props.type === 'warning') $$render(consequent_2);
		});
	}

	$.append($$anchor, fragment);
}
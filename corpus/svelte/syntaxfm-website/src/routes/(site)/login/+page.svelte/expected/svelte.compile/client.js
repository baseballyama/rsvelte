import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Github from '$assets/github.svg';
import { enhance } from '$app/forms';
import { loading } from '$state/loading';
import { form_action } from '$lib/form_action';

var root = $.from_html(`<p>Hell yea, You are currently Logged In</p> <form action="/?/logout" method="POST"><button class="button" type="submit">Logout</button></form>`, 1);
var root_1 = $.from_html(`<p>If you are not on the Syntax team, this login will do nothing for you.</p> <a class="button subtle" href="/api/oauth/github" rel="external"><img width="20" alt="Github Logo"/> Login With Github</a>`, 1);
var root_2 = $.from_html(`<section class="content svelte-1pltak1"><div class="card svelte-1pltak1"><h1 class="h3">Login</h1> <!></div></section>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const { user } = $$props.data;
	var section = root_2();
	var div = $.child(section);
	var node = $.sibling($.child(div), 2);

	{
		var consequent = ($$anchor) => {
			var fragment = root();
			var form = $.sibling($.first_child(fragment), 2);

			$.action(form, ($$node, $$action_arg) => enhance?.($$node, $$action_arg), () => form_action({ message: 'Logout ' }));
			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var fragment_1 = root_1();
			var a = $.sibling($.first_child(fragment_1), 2);
			var img = $.child(a);

			$.next();
			$.reset(a);
			$.template_effect(() => $.set_attribute(img, 'src', Github));
			$.delegated('click', a, () => loading.setLoading(true));
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (user) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
	$.pop();
}

$.delegate(['click']);
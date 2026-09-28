import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Github from '$assets/github.svg';
import DropdownMenu from '$lib/DropdownMenu.svelte';
import { enhance } from '$app/forms';
import { loading } from '$state/loading';
import { form_action } from '$lib/form_action';

var root = $.from_html(`<img class="avatar svelte-gq0jcd" alt="User Avatar"/>`);
var root_1 = $.from_html(`<div><form action="/?/logout" method="POST"><button type="submit">Logout</button></form></div>`);
var root_2 = $.from_html(`<a href="/api/oauth/github" rel="external"><img width="20" alt="Github Logo"/> Login With Github</a>`);

export default function UserMenu($$anchor, $$props) {
	$.push($$props, true);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			{
				const button = ($$anchor) => {
					var img = root();

					$.template_effect(() => $.set_attribute(img, 'src', $$props.user.avatar_url));
					$.append($$anchor, img);
				};

				DropdownMenu($$anchor, {
					popover_id: 'user-menu',
					button,
					children: ($$anchor, $$slotProps) => {
						var div = root_1();
						var form = $.child(div);

						$.action(form, ($$node, $$action_arg) => enhance?.($$node, $$action_arg), () => form_action({ message: 'Logout ' }));
						$.reset(div);
						$.append($$anchor, div);
					},
					$$slots: { button: true, default: true }
				});
			}
		};

		var alternate = ($$anchor) => {
			var a = root_2();
			var img_1 = $.child(a);

			$.next();
			$.reset(a);
			$.template_effect(() => $.set_attribute(img_1, 'src', Github));
			$.delegated('click', a, () => loading.setLoading(true));
			$.append($$anchor, a);
		};

		$.if(node, ($$render) => {
			if ($$props.user) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);
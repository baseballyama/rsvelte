import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Primo from '$lib/builder/Primo.svelte';
import { check_session } from '$lib/pocketbase/user';
import { refresh_author_mode } from '$lib/pocketbase/author_mode';
import { onMount } from 'svelte';
import { goto } from '$app/navigation';
import { page } from '$app/state';
import { Sites } from '$lib/pocketbase/collections';
import { current_user, set_current_user } from '$lib/pocketbase/user';
import { Loader } from 'lucide-svelte';

var root = $.from_html(`<div class="placeholder svelte-9j1gec">Site not found</div>`);
var root_1 = $.from_html(`<div class="placeholder svelte-9j1gec"><!></div>`);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	const $current_user = () => $.store_get(current_user, '$current_user', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	onMount(async () => {
		if (!await check_session()) {
			await goto('/admin/auth');

			return;
		}

		refresh_author_mode();
	});

	const site_id = $.derived(() => page.params.site_id);
	const site = $.derived(() => $.get(site_id) ? Sites.one($.get(site_id)) : null);

	$.user_effect(() => set_current_user($.get(site) || undefined));

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.append($$anchor, div);
		};

		var consequent_1 = ($$anchor) => {
			Primo($$anchor, {
				get site() {
					return $.get(site);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node_1 = $.first_child(fragment_2);

					$.snippet(node_1, () => $$props.children ?? $.noop);
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		};

		var alternate = ($$anchor) => {
			var div_1 = root_1();
			var node_2 = $.child(div_1);

			Loader(node_2, {});
			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if ($.get(site) === null) $$render(consequent); else if ($.get(site) && $current_user()) $$render(consequent_1, 1); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}
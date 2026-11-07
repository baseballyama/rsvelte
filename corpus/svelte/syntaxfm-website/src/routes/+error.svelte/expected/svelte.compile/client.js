import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/stores';
import Layout from './(site)/+layout.svelte';

var root = $.from_html(`<p class="error svelte-1j96wlh"> </p>`);
var root_1 = $.from_html(`<p class="error svelte-1j96wlh">Something went wrong. Don't worry, we use Sentry!</p>`);
var root_2 = $.from_html(`<div><h2>Oopsie-daisy</h2> <!></div>`);

export default function _error($$anchor, $$props) {
	$.push($$props, true);

	const $page = () => $.store_get(page, '$page', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	// error page does not automatically infer layout data...
	let user = $.derived(() => $$props.data.user),
		user_theme = $.derived(() => $$props.data.user_theme);

	{
		let $0 = $.derived(() => ({ user: $.get(user), user_theme: $.get(user_theme), latest: [] }));

		Layout($$anchor, {
			get data() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				var div = root_2();
				var node = $.sibling($.child(div), 2);

				{
					var consequent = ($$anchor) => {
						var p = root();
						var text = $.only_child(p, true);

						$.template_effect(() => $.set_text(text, $page().error.message));
						$.append($$anchor, p);
					};

					var alternate = ($$anchor) => {
						var p_1 = root_1();

						$.append($$anchor, p_1);
					};

					$.if(node, ($$render) => {
						if ($page()?.error?.message) $$render(consequent); else $$render(alternate, -1);
					});
				}

				$.reset(div);
				$.append($$anchor, div);
			},
			$$slots: { default: true }
		});
	}

	$.pop();
	$$cleanup();
}
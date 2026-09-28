import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { paletteStore } from '../store/PaletteStore';
import { onDestroy, getContext } from 'svelte';
import Result from './Result.svelte';
import { getNonEmptyArray, groupActions } from '../utils';
import { THEME_CONTEXT } from '../constants';

var root = $.from_html(`<div class="cp-group-header svelte-1wexb39"> </div>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div role="listbox" id="command-palette-results"></div>`);
var root_3 = $.from_html(`<div class="cp-empty-content svelte-1wexb39"><svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg> <p class="svelte-1wexb39">No results found</p> <span class="svelte-1wexb39">Try a different search term</span></div>`);
var root_4 = $.from_html(`<div class="cp-empty svelte-1wexb39"><!></div>`);

export default function ResultPanel($$anchor, $$props) {
	$.push($$props, true);

	const $themeCtx = () => $.store_get(themeCtx, '$themeCtx', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let actions = $.state($.proxy([]));

	const unsubscribe = paletteStore.subscribe((value) => {
		$.set(
			actions,
			value.results.length > 0
				? getNonEmptyArray(value.results)
				: getNonEmptyArray(value.commands),
			true
		);
	});

	const themeCtx = getContext(THEME_CONTEXT);
	const { resultsContainerClass, unstyled, resultsContainerStyle } = $themeCtx();

	// Group actions by their group property
	let groupedActions = $.derived(() => groupActions($.get(actions)));

	onDestroy(unsubscribe);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var div = root_2();
			let classes;

			$.each(div, 21, () => [...$.get(groupedActions).entries()], $.index, ($$anchor, $$item, $$index_1, $$array) => {
				var $$array_1 = $.derived(() => $.to_array($.get($$item), 2));
				let groupName = () => $.get($$array_1)[0];
				let groupActions = () => $.get($$array_1)[1];
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				{
					var consequent = ($$anchor) => {
						var div_1 = root();
						var text = $.only_child(div_1, true);

						$.template_effect(() => $.set_text(text, groupName()));
						$.append($$anchor, div_1);
					};

					$.if(node_1, ($$render) => {
						if (groupName()) $$render(consequent);
					});
				}

				var node_2 = $.sibling(node_1, 2);

				$.each(node_2, 17, groupActions, (action) => action.actionId, ($$anchor, action) => {
					Result($$anchor, {
						get action() {
							return $.get(action);
						}
					});
				});

				$.append($$anchor, fragment_1);
			});

			$.reset(div);

			$.template_effect(() => {
				classes = $.set_class(div, 1, $.clsx(resultsContainerClass), 'svelte-1wexb39', classes, { 'cp-results': !unstyled });
				$.set_style(div, resultsContainerStyle);
			});

			$.append($$anchor, div);
		};

		var alternate_1 = ($$anchor) => {
			var div_2 = root_4();
			var node_3 = $.child(div_2);

			{
				var consequent_2 = ($$anchor) => {
					var fragment_3 = $.comment();
					var node_4 = $.first_child(fragment_3);

					$.snippet(node_4, () => $$props.emptyState);
					$.append($$anchor, fragment_3);
				};

				var alternate = ($$anchor) => {
					var div_3 = root_3();

					$.append($$anchor, div_3);
				};

				$.if(node_3, ($$render) => {
					if ($$props.emptyState) $$render(consequent_2); else $$render(alternate, -1);
				});
			}

			$.reset(div_2);
			$.append($$anchor, div_2);
		};

		$.if(node, ($$render) => {
			if ($.get(actions).length > 0) $$render(consequent_1); else $$render(alternate_1, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}
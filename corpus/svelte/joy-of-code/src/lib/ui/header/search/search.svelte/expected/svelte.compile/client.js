import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createDialog, melt } from '@melt-ui/svelte';
import { fade } from 'svelte/transition';
import { onNavigate } from '$app/navigation';
import { browser } from '$app/environment';
import SearchIcon from './search-icon.svelte';
import SearchWorker from './search-worker?worker';

var root = $.from_html(`<p>Loading...</p>`);
var root_1 = $.from_html(`<li class="svelte-gmozwn"></li>`);
var root_2 = $.from_html(`<li class="svelte-gmozwn"><a class="svelte-gmozwn"></a> <ol class="svelte-gmozwn"></ol></li>`);
var root_3 = $.from_html(`<div class="results svelte-gmozwn"><!> <ul></ul></div>`);
var root_4 = $.from_html(`<div class="overlay svelte-gmozwn"></div> <div class="content svelte-gmozwn"><input placeholder="Search" autocomplete="off" spellcheck="false" type="search" class="svelte-gmozwn"/> <!></div>`, 1);
var root_5 = $.from_html(`<button class="open-search svelte-gmozwn"><!> <span class="svelte-gmozwn">Search</span> <div class="shortcut svelte-gmozwn"><kbd class="svelte-gmozwn"> </kbd> + <kbd class="svelte-gmozwn">K</kbd></div></button> <div><!></div>`, 1);

export default function Search($$anchor, $$props) {
	$.push($$props, true);

	const $open = () => $.store_get(open, '$open', $$stores);
	const $trigger = () => $.store_get(trigger, '$trigger', $$stores);
	const $portalled = () => $.store_get(portalled, '$portalled', $$stores);
	const $overlay = () => $.store_get(overlay, '$overlay', $$stores);
	const $content = () => $.store_get(content, '$content', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	const {
		elements: { trigger, portalled, overlay, content },
		states: { open }
	} = createDialog();

	const platform = browser && window.navigator.platform;
	let search = $.state('idle');
	let searchTerm = $.state('');
	let results = $.state($.proxy([]));
	let searchWorker = $.state(void 0);

	function initialize() {
		if ($.get(search) === 'ready') return;

		$.set(search, 'load');
		$.set(searchWorker, new SearchWorker(), true);

		$.get(searchWorker).addEventListener('message', (e) => {
			const { type, payload } = e.data;

			type === 'ready' && $.set(search, 'ready');
			type === 'results' && $.set(results, payload.results, true);
		});

		$.get(searchWorker).postMessage({ type: 'load' });
	}

	onNavigate(() => {
		$.store_set(open, false);
	});

	$.user_effect(() => {
		if ($.get(search) === 'ready') {
			$.get(searchWorker)?.postMessage({ type: 'search', payload: { searchTerm: $.get(searchTerm) } });
		}
	});

	$.user_effect(() => {
		if ($.get(searchTerm) && !$open()) {
			$.set(searchTerm, '');
		}
	});

	var fragment = root_5();

	$.event('keydown', $.window, (e) => {
		if (e.ctrlKey || e.metaKey) {
			if (e.key === 'k' || e.key === 'K') {
				e.preventDefault();

				if ($.get(search) === 'idle') initialize();

				$.store_set(open, !$open());
			}
		}
	});

	var button = $.first_child(fragment);
	var node = $.child(button);

	SearchIcon(node, {});

	var div = $.sibling(node, 4);
	var kbd = $.child(div);
	var text = $.only_child(kbd, true);

	$.next(2);
	$.reset(div);
	$.reset(button);
	$.action(button, ($$node, $$action_arg) => melt?.($$node, $$action_arg), $trigger);

	var div_1 = $.sibling(button, 2);
	var node_1 = $.child(div_1);

	{
		var consequent_3 = ($$anchor) => {
			var fragment_1 = root_4();
			var div_2 = $.first_child(fragment_1);

			$.action(div_2, ($$node, $$action_arg) => melt?.($$node, $$action_arg), $overlay);

			var div_3 = $.sibling(div_2, 2);
			var input = $.child(div_3);

			$.remove_input_defaults(input);

			var node_2 = $.sibling(input, 2);

			{
				var consequent_2 = ($$anchor) => {
					var div_4 = root_3();
					var node_3 = $.child(div_4);

					{
						var consequent = ($$anchor) => {
							var p = root();

							$.append($$anchor, p);
						};

						$.if(node_3, ($$render) => {
							if ($.get(search) === 'load') $$render(consequent);
						});
					}

					var ul = $.sibling(node_3, 2);

					$.each(ul, 21, () => $.get(results), $.index, ($$anchor, result) => {
						var fragment_2 = $.comment();
						var node_4 = $.first_child(fragment_2);

						{
							var consequent_1 = ($$anchor) => {
								var li = root_2();
								var a = $.child(li);

								$.html(a, () => $.get(result).title, true);
								$.reset(a);

								var ol = $.sibling(a, 2);

								$.each(ol, 21, () => $.get(result).content, $.index, ($$anchor, content, $$index, $$array) => {
									var li_1 = root_1();

									$.html(li_1, () => $.get(content), true);
									$.reset(li_1);
									$.append($$anchor, li_1);
								});

								$.reset(ol);
								$.reset(li);
								$.template_effect(() => $.set_attribute(a, 'href', `/${$.get(result).slug ?? ''}`));
								$.append($$anchor, li);
							};

							$.if(node_4, ($$render) => {
								if ($.get(result).content.length > 0) $$render(consequent_1);
							});
						}

						$.append($$anchor, fragment_2);
					});

					$.reset(ul);
					$.reset(div_4);
					$.append($$anchor, div_4);
				};

				$.if(node_2, ($$render) => {
					if ($.get(results).length > 0) $$render(consequent_2);
				});
			}

			$.reset(div_3);
			$.action(div_3, ($$node, $$action_arg) => melt?.($$node, $$action_arg), $content);
			$.transition(1, div_2, () => fade, () => ({ duration: 200 }));
			$.bind_value(input, () => $.get(searchTerm), ($$value) => $.set(searchTerm, $$value));
			$.append($$anchor, fragment_1);
		};

		$.if(node_1, ($$render) => {
			if ($open()) $$render(consequent_3);
		});
	}

	$.reset(div_1);
	$.action(div_1, ($$node, $$action_arg) => melt?.($$node, $$action_arg), $portalled);
	$.template_effect(() => $.set_text(text, platform === 'MacIntel' ? '⌘' : 'Ctrl'));
	$.delegated('click', button, initialize);
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);
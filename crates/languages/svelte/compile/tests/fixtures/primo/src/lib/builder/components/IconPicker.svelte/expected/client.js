import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TextInput from '../ui/TextInput.svelte';
import { createEventDispatcher } from 'svelte';
import { fade } from 'svelte/transition';
import Icon from '@iconify/svelte';
import { createPopperActions } from 'svelte-popperjs';
import { clickOutside } from '../utilities';
import { offsetByFixedParents } from '../utils/popper-fix';

var root = $.from_html(`<div class="icon-preview svelte-mby8vt"><button class="svelte-mby8vt"><!></button> <!></div>`);
var root_1 = $.from_html(`<!> <form class="svelte-mby8vt"><!></form>`, 1);
var root_2 = $.from_html(`<button class="icon-preview svelte-mby8vt" aria-label="select icon"><!></button>`);
var root_3 = $.from_html(`<button type="button"><!></button>`);

var root_4 = $.from_html(`<span style="grid-column: 1 / -1;
					padding: 0.5rem;
					font-size: 0.875rem;
					border-left: 3px solid red;">No icons found</span>`);

var root_5 = $.from_html(`<div class="icons svelte-mby8vt"><button class="close svelte-mby8vt" aria-label="Close"><!></button> <!></div>`);
var root_6 = $.from_html(`<div class="popup svelte-mby8vt"><form class="svelte-mby8vt"><!></form> <!></div>`);

var root_7 = $.from_html(`<span style="grid-column: 1 / -1;
				padding: 0.5rem;
				font-size: 0.875rem;
				border-left: 3px solid red;">No icons found</span>`);

var root_8 = $.from_html(`<div><div class="container svelte-mby8vt"><!></div> <!> <!></div>`);

export default function IconPicker($$anchor, $$props) {
	$.push($$props, true);

	const dispatch = createEventDispatcher();

	/**
	 * @typedef {Object} Props
	 * @property {any} [icon]
	 * @property {string} [search_query]
	 * @property {string} [variant]
	 * @property {any} [svg_preview]
	 */
	/** @type {Props} */
	let search_query = $.prop($$props, 'search_query', 15, ''),
		variant = $.prop($$props, 'variant', 3, 'large'),
		svg_preview = $.prop($$props, 'svg_preview', 3, null);

	const [popperRef, popperContent] = createPopperActions({
		placement: 'bottom-start',
		strategy: 'fixed',
		modifiers: [offsetByFixedParents]
	});

	let searched = $.state(false);

	// search immediately when passed a query
	if (search_query()) {
		search();
	}

	// Auto-search when search_query changes and has content
	$.user_effect(() => {
		if (search_query() && search_query().trim()) {
			search();
		} else if (search_query() === '') {
			$.set(searched, false);
		}
	});

	let icons = $.state($.proxy([]));

	async function search() {
		fetch(`https://api.iconify.design/search?query=${encodeURIComponent(search_query().trim())}&limit=200`).then((res) => res.json()).then((data) => {
			$.set(icons, data.icons, true);
			$.set(searched, true);
		});
	}

	let showing_popover = $.state(false);
	var div = root_8();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	{
		var consequent_2 = ($$anchor) => {
			var fragment = root_1();
			var node_1 = $.first_child(fragment);

			{
				var consequent_1 = ($$anchor) => {
					var div_2 = root();
					var button = $.child(div_2);
					var node_2 = $.child(button);

					Icon(node_2, { icon: 'material-symbols:delete' });
					$.reset(button);

					var node_3 = $.sibling(button, 2);

					{
						var consequent = ($$anchor) => {
							var fragment_1 = $.comment();
							var node_4 = $.first_child(fragment_1);

							$.html(node_4, svg_preview);
							$.append($$anchor, fragment_1);
						};

						var alternate = ($$anchor) => {
							Icon($$anchor, {
								get icon() {
									return $$props.icon;
								}
							});
						};

						$.if(node_3, ($$render) => {
							if (svg_preview()) $$render(consequent); else $$render(alternate, -1);
						});
					}

					$.reset(div_2);
					$.delegated('click', button, () => dispatch('input', null));
					$.append($$anchor, div_2);
				};

				$.if(node_1, ($$render) => {
					if (svg_preview() || $$props.icon) $$render(consequent_1);
				});
			}

			var form = $.sibling(node_1, 2);
			var node_5 = $.child(form);

			{
				let $0 = $.derived(() => ({ label: 'Search', type: 'submit', disabled: !search_query() }));

				TextInput(node_5, {
					prefix_icon: 'tabler:search',
					get button() {
						return $.get($0);
					},

					get value() {
						return search_query();
					},

					set value($$value) {
						search_query($$value);
					}
				});
			}

			$.reset(form);

			$.event('submit', form, (e) => {
				e.preventDefault();
				search();
			});

			$.append($$anchor, fragment);
		};

		var consequent_3 = ($$anchor) => {
			var button_1 = root_2();
			var node_6 = $.child(button_1);

			Icon(node_6, {
				get icon() {
					return $$props.icon;
				}
			});

			$.reset(button_1);
			$.action(button_1, ($$node) => popperRef?.($$node));
			$.delegated('click', button_1, () => $.set(showing_popover, !$.get(showing_popover)));
			$.append($$anchor, button_1);
		};

		$.if(node, ($$render) => {
			if (variant() === 'large') $$render(consequent_2); else if (variant() === 'small') $$render(consequent_3, 1);
		});
	}

	$.reset(div_1);

	var node_7 = $.sibling(div_1, 2);

	{
		var consequent_5 = ($$anchor) => {
			var div_3 = root_6();
			var form_1 = $.child(div_3);
			var node_8 = $.child(form_1);

			{
				let $0 = $.derived(() => ({ label: 'Search', type: 'submit', disabled: !search_query() }));

				TextInput(node_8, {
					autofocus: true,
					prefix_icon: 'tabler:search',
					label: 'Search icons',
					get button() {
						return $.get($0);
					},

					get value() {
						return search_query();
					},

					set value($$value) {
						search_query($$value);
					}
				});
			}

			$.reset(form_1);

			var node_9 = $.sibling(form_1, 2);

			{
				var consequent_4 = ($$anchor) => {
					var div_4 = root_5();
					var button_2 = $.child(div_4);
					var node_10 = $.child(button_2);

					Icon(node_10, { icon: 'material-symbols:close' });
					$.reset(button_2);

					var node_11 = $.sibling(button_2, 2);

					$.each(
						node_11,
						17,
						() => $.get(icons),
						$.index,
						($$anchor, item) => {
							var button_3 = root_3();
							let classes;
							var node_12 = $.child(button_3);

							Icon(node_12, {
								get icon() {
									return $.get(item);
								},
								width: '50px'
							});

							$.reset(button_3);
							$.template_effect(() => classes = $.set_class(button_3, 1, 'icon svelte-mby8vt', null, classes, { active: $.get(item) === $$props.icon }));

							$.delegated('click', button_3, () => {
								dispatch('input', $.get(item));
								$.set(showing_popover, false);
								search_query('');
							});

							$.append($$anchor, button_3);
						},
						($$anchor) => {
							var span = root_4();

							$.append($$anchor, span);
						}
					);

					$.reset(div_4);

					$.delegated('click', button_2, () => {
						$.set(searched, false);
						search_query('');
					});

					$.transition(1, div_4, () => fade);
					$.append($$anchor, div_4);
				};

				$.if(node_9, ($$render) => {
					if ($.get(searched)) $$render(consequent_4);
				});
			}

			$.reset(div_3);
			$.action(div_3, ($$node) => clickOutside?.($$node));
			$.action(div_3, ($$node, $$action_arg) => popperContent?.($$node, $$action_arg), () => ({ modifiers: [{ name: 'offset', options: { offset: [0, 3] } }] }));
			$.event('click_outside', div_3, () => $.set(showing_popover, false));

			$.event('submit', form_1, (e) => {
				e.preventDefault();
				search();
			});

			$.transition(1, div_3, () => fade, () => ({ duration: 100 }));
			$.append($$anchor, div_3);
		};

		$.if(node_7, ($$render) => {
			if ($.get(showing_popover)) $$render(consequent_5);
		});
	}

	var node_13 = $.sibling(node_7, 2);

	{
		var consequent_6 = ($$anchor) => {
			var div_5 = root_5();
			var button_4 = $.child(div_5);
			var node_14 = $.child(button_4);

			Icon(node_14, { icon: 'material-symbols:close' });
			$.reset(button_4);

			var node_15 = $.sibling(button_4, 2);

			$.each(
				node_15,
				17,
				() => $.get(icons),
				$.index,
				($$anchor, item) => {
					var button_5 = root_3();
					let classes_1;
					var node_16 = $.child(button_5);

					Icon(node_16, {
						get icon() {
							return $.get(item);
						},
						width: '50px'
					});

					$.reset(button_5);
					$.template_effect(() => classes_1 = $.set_class(button_5, 1, 'icon svelte-mby8vt', null, classes_1, { active: $.get(item) === $$props.icon }));

					$.delegated('click', button_5, () => {
						dispatch('input', $.get(item));

						// Hide options after selecting an icon in large variant
						$.set(searched, false);

						search_query('');
					});

					$.append($$anchor, button_5);
				},
				($$anchor) => {
					var span_1 = root_7();

					$.append($$anchor, span_1);
				}
			);

			$.reset(div_5);

			$.delegated('click', button_4, () => {
				$.set(searched, false);
				search_query('');
			});

			$.transition(1, div_5, () => fade);
			$.append($$anchor, div_5);
		};

		$.if(node_13, ($$render) => {
			if ($.get(searched) && variant() === 'large') $$render(consequent_6);
		});
	}

	$.reset(div);
	$.template_effect(() => $.set_class(div, 1, `IconPicker ${variant() ?? ''}`, 'svelte-mby8vt'));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);
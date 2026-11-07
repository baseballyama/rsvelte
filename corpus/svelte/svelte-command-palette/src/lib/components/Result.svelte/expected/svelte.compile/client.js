import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { paletteStore } from '../store/PaletteStore';
import { onMount, getContext } from 'svelte';
import { runAction } from '../utils';
import KeyboardButton from './KeyboardButton.svelte';
import { THEME_CONTEXT } from '../constants';

var root = $.from_html(`<img alt="" width="20" height="20" class="svelte-16jqtxf"/>`);
var root_1 = $.from_html(`<span class="cp-result-emoji svelte-16jqtxf"> </span>`);
var root_2 = $.from_html(`<div class="cp-result-icon svelte-16jqtxf"><!></div>`);
var root_3 = $.from_html(`<div> </div>`);
var root_4 = $.from_html(`<span> </span>`);
var root_5 = $.from_html(`<div class="cp-result-shortcuts svelte-16jqtxf"></div>`);
var root_6 = $.from_html(`<div role="option"><!> <div class="cp-result-content svelte-16jqtxf"><div><span> </span></div> <!> <!></div> <!></div>`);

export default function Result($$anchor, $$props) {
	$.push($$props, true);

	const $themeCtx = () => $.store_get(themeCtx, '$themeCtx', $$stores);
	const $paletteStore = () => $.store_get(paletteStore, '$paletteStore', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let elRef = $.state(void 0);
	let isActive = $.state(false);
	let formattedShortcut = $.state($.proxy([]));
	const themeCtx = getContext(THEME_CONTEXT);

	const {
		resultContainerClass,
		unstyled,
		optionSelectedClass,
		titleClass,
		subtitleClass,
		descriptionClass,
		resultContainerStyle,
		titleStyle,
		subtitleStyle,
		descriptionStyle,
		optionSelectedStyle
	} = $themeCtx();

	// Replace afterUpdate with $effect
	$.user_effect(() => {
		if ($$props.action.actionId === $paletteStore().activeCommandId && $.get(elRef)) {
			$.set(isActive, true);

			requestAnimationFrame(() => {
				$.get(elRef)?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' });
			});
		} else {
			$.set(isActive, false);
		}
	});

	const handleRunAction = () => {
		runAction({ action: $$props.action });
	};

	onMount(async () => {
		const tinyKeys = await import('tinykeys');
		const { parseKeybinding } = tinyKeys;

		if ($$props.action.shortcut) {
			const parsedShortcut = parseKeybinding($$props.action.shortcut);

			$.set(formattedShortcut, parsedShortcut.flat().filter((s) => s.length > 0), true);
		}
	});

	const onMouseEnter = () => {
		$.set(isActive, true);

		paletteStore.update((value) => {
			return {
				...value,
				activeCommandId: $$props.action.actionId || '',
				selectedCommandId: $$props.action.actionId || ''
			};
		});
	};

	const onMouseLeave = () => {
		$.set(isActive, false);
	};

	var div = root_6();
	let classes;

	$.set_attribute(div, 'tabindex', -1);

	var node = $.child(div);

	{
		var consequent_3 = ($$anchor) => {
			var div_1 = root_2();
			var node_1 = $.child(div_1);

			{
				var consequent = ($$anchor) => {
					var fragment = $.comment();
					var node_2 = $.first_child(fragment);

					$.snippet(node_2, () => $$props.action.icon);
					$.append($$anchor, fragment);
				};

				var consequent_2 = ($$anchor) => {
					var fragment_1 = $.comment();
					var node_3 = $.first_child(fragment_1);

					{
						var consequent_1 = ($$anchor) => {
							var img = root();

							$.template_effect(() => $.set_attribute(img, 'src', $$props.action.icon));
							$.append($$anchor, img);
						};

						var d = $.derived(() => $$props.action.icon.startsWith('http') || $$props.action.icon.startsWith('/'));

						var alternate = ($$anchor) => {
							var span = root_1();
							var text = $.only_child(span, true);

							$.template_effect(() => $.set_text(text, $$props.action.icon));
							$.append($$anchor, span);
						};

						$.if(node_3, ($$render) => {
							if ($.get(d)) $$render(consequent_1); else $$render(alternate, -1);
						});
					}

					$.append($$anchor, fragment_1);
				};

				$.if(node_1, ($$render) => {
					if (typeof $$props.action.icon === 'function') $$render(consequent); else if (typeof $$props.action.icon === 'string') $$render(consequent_2, 1);
				});
			}

			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if ($$props.action.icon) $$render(consequent_3);
		});
	}

	var div_2 = $.sibling(node, 2);
	var div_3 = $.child(div_2);
	let classes_1;
	var span_1 = $.child(div_3);
	var text_1 = $.only_child(span_1, true);

	$.reset(div_3);

	var node_4 = $.sibling(div_3, 2);

	{
		var consequent_4 = ($$anchor) => {
			var div_4 = root_3();
			var text_2 = $.only_child(div_4, true);

			$.template_effect(() => {
				$.set_class(div_4, 1, `cp-result-subtitle ${subtitleClass || ''}`, 'svelte-16jqtxf');
				$.set_style(div_4, subtitleStyle || '');
				$.set_text(text_2, $$props.action.subTitle);
			});

			$.append($$anchor, div_4);
		};

		$.if(node_4, ($$render) => {
			if ($$props.action.subTitle) $$render(consequent_4);
		});
	}

	var node_5 = $.sibling(node_4, 2);

	{
		var consequent_5 = ($$anchor) => {
			var div_5 = root_3();
			var text_3 = $.only_child(div_5, true);

			$.template_effect(() => {
				$.set_class(div_5, 1, `cp-result-description ${descriptionClass || ''}`, 'svelte-16jqtxf');
				$.set_style(div_5, descriptionStyle || '');
				$.set_text(text_3, $$props.action.description);
			});

			$.append($$anchor, div_5);
		};

		$.if(node_5, ($$render) => {
			if ($$props.action.description) $$render(consequent_5);
		});
	}

	$.reset(div_2);

	var node_6 = $.sibling(div_2, 2);

	{
		var consequent_6 = ($$anchor) => {
			var div_6 = root_5();

			$.each(div_6, 21, () => $.get(formattedShortcut), $.index, ($$anchor, shortcut) => {
				{
					const children = ($$anchor) => {
						var span_2 = root_4();
						var text_4 = $.only_child(span_2, true);

						$.template_effect(() => $.set_text(text_4, $.get(shortcut)));
						$.append($$anchor, span_2);
					};

					KeyboardButton($$anchor, { children, $$slots: { default: true } });
				}
			});

			$.reset(div_6);
			$.append($$anchor, div_6);
		};

		$.if(node_6, ($$render) => {
			if ($.get(formattedShortcut).length > 0) $$render(consequent_6);
		});
	}

	$.reset(div);
	$.bind_this(div, ($$value) => $.set(elRef, $$value), () => $.get(elRef));

	$.template_effect(() => {
		classes = $.set_class(div, 1, `${resultContainerClass || ''} ${$.get(isActive) ? !unstyled ? '' : optionSelectedClass || '' : ''}`, 'svelte-16jqtxf', classes, {
			'cp-result': !unstyled,
			'cp-result-active': !unstyled && $.get(isActive)
		});

		$.set_style(div, `${resultContainerStyle || ''} ${$.get(isActive) ? optionSelectedStyle || '' : ''}`);
		$.set_attribute(div, 'aria-selected', $.get(isActive));
		$.set_attribute(div, 'id', `palette-${$$props.action.actionId}`);
		classes_1 = $.set_class(div_3, 1, `cp-result-title ${titleClass || ''}`, 'svelte-16jqtxf', classes_1, { title: !unstyled });
		$.set_style(div_3, titleStyle || '');
		$.set_text(text_1, $$props.action.title);
	});

	$.delegated('click', div, handleRunAction);
	$.delegated('keydown', div, (e) => e.key === 'Enter' && handleRunAction());
	$.event('mouseenter', div, onMouseEnter);
	$.event('mouseleave', div, onMouseLeave);
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}

$.delegate(['click', 'keydown']);
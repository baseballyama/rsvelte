import 'svelte/internal/disclose-version';
import { globalOpts, panelState, setGlobalOpts } from './globalopts.svelte';
import * as $ from 'svelte/internal/client';
import { starlightTheme } from './sltheme.svelte.js';
import { DEFAULT_OPTIONS } from 'svelte-inspect-value';
import * as easings from 'svelte/easing';
import { slide } from 'svelte/transition';
import OptionToggle from './OptionToggleCheck.svelte';
import { onMount } from 'svelte';

export function scrollTo(id) {
	if (!panelState.ele) return;

	const wasOpen = panelState.keepOpen;

	panelState.keepOpen = true;

	const input = panelState.ele?.querySelector(id);

	if (!input) return;

	// input.focus()
	input.classList.add('focused');

	input.scrollIntoView({ behavior: 'smooth', block: 'center' });

	setTimeout(
		() => {
			input.classList.remove('focused');
			panelState.keepOpen = wasOpen;
		},
		3000
	);
}

var root = $.from_html(`<option> </option>`);
var root_1 = $.from_html(`<div id="global-opts"><div class="options-title svelte-14mtmgv"><div class="tool-buttons svelte-14mtmgv"><button title="Keep Open"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" class="svelte-14mtmgv"><path fill="currentColor" d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2z"></path></svg></button> <button title="Reset Settings" class="tool-button svelte-14mtmgv"><svg style="margin-left: 1px" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M2 12a9 9 0 0 0 9 9c2.39 0 4.68-.94 6.4-2.6l-1.5-1.5A6.7 6.7 0 0 1 11 19c-6.24 0-9.36-7.54-4.95-11.95S18 5.77 18 12h-3l4 4h.1l3.9-4h-3a9 9 0 0 0-18 0"></path></svg></button></div> <span style="text-align: left; width: 100%; margin-left: 1.5rem;">Global Options</span> <a href="/api/type-aliases/inspectoptions" style="text-decoration: none;" class="svelte-14mtmgv">docs</a></div> <div class="go-body svelte-14mtmgv" id="global-opts-body"><label>theme <select name="theme" class="svelte-14mtmgv"><option>inspect</option><option>drak</option><option>stereo</option><option>dark</option><option>light</option><option>plain</option></select></label> <!> <!> <!> <!> <!> <!> <!> <label>preview depth <input type="number" min="0" name="preview-depth" class="svelte-14mtmgv"/></label> <label>preview entries <input type="number" min="0" name="preview-entries" class="svelte-14mtmgv"/></label> <label title="animation rate">anim rate <input type="number" min="0.1" max="10" name="animation-rate" class="svelte-14mtmgv"/></label> <label title="easing">easing <select class="svelte-14mtmgv"></select></label> <!> <label>string quotes <select name="quotes" class="svelte-14mtmgv"><option>single</option><option>double</option><option>none</option></select></label> <label>collapse strings <input type="number" min="0" name="collapse-strings" class="svelte-14mtmgv"/></label> <label>search <select name="search" class="svelte-14mtmgv"><option>off</option><option>highlight</option><option>filter</option><option>filter-strict</option></select></label> <!></div></div>`);

export default function GlobalOptionsList($$anchor, $$props) {
	$.push($$props, true);

	let currentTheme = undefined;
	let bodyEle = $.state(void 0);

	$.user_effect(() => {
		if ($.get(bodyEle)) {
			panelState.ele = $.get(bodyEle);
		}
	});

	onMount(() => {
		const doc = document.documentElement;

		if ('theme' in doc.dataset) {
			starlightTheme.current = doc.dataset['theme'];
		}

		const observer = new MutationObserver((mutations) => {
			mutations.forEach((m) => {
				if (m.type === 'attributes' && m.target instanceof HTMLElement) {
					const dataSet = m.target.dataset;

					if ('theme' in dataSet && currentTheme !== dataSet['theme']) {
						if (dataSet['theme'] === 'dark') {
							globalOpts.theme = 'inspect';
							starlightTheme.current = 'dark';
						} else {
							globalOpts.theme = 'light';
							starlightTheme.current = 'light';
						}

						currentTheme = dataSet['theme'];
					}
				}
			});
		});

		observer.observe(doc, { attributes: true });

		return () => {
			observer.disconnect();
		};
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root_1();
			var div_1 = $.child(div);
			var div_2 = $.child(div_1);
			var button = $.child(div_2);
			var button_1 = $.sibling(button, 2);

			$.reset(div_2);
			$.next(4);
			$.reset(div_1);

			var div_3 = $.sibling(div_1, 2);
			var label = $.child(div_3);
			var select = $.sibling($.child(label));

			$.init_select(select);
			$.reset(label);

			var node_1 = $.sibling(label, 2);

			OptionToggle(node_1, {
				key: 'borderless',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('borderless');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			OptionToggle(node_2, {
				key: 'parseJson',
				title: 'parse json strings',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('parse json');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			OptionToggle(node_3, {
				key: 'noanimate',
				title: 'disable animation',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('noanimate');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			OptionToggle(node_4, {
				key: 'showTypes',
				title: 'show types',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('types');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			OptionToggle(node_5, {
				key: 'showLength',
				title: 'show lengths / number of entries',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('lengths');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_5, 2);

			OptionToggle(node_6, {
				key: 'showTools',
				title: 'show tools on row hover',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('tools');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_6, 2);

			OptionToggle(node_7, {
				key: 'showPreview',
				title: 'enable entry previews',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_6 = $.text('preview');

					$.append($$anchor, text_6);
				},
				$$slots: { default: true }
			});

			var label_1 = $.sibling(node_7, 2);
			var input_1 = $.sibling($.child(label_1));

			$.remove_input_defaults(input_1);
			$.reset(label_1);

			var label_2 = $.sibling(label_1, 2);
			var input_2 = $.sibling($.child(label_2));

			$.remove_input_defaults(input_2);
			$.reset(label_2);

			var label_3 = $.sibling(label_2, 2);
			var input_3 = $.sibling($.child(label_3));

			$.remove_input_defaults(input_3);
			$.set_attribute(input_3, 'step', 0.1);
			$.reset(label_3);

			var label_4 = $.sibling(label_3, 2);
			var select_1 = $.sibling($.child(label_4));

			$.each(select_1, 21, () => Object.keys(easings), $.index, ($$anchor, easing) => {
				var option = root();
				var text_7 = $.only_child(option, true);
				var option_value = {};

				$.template_effect(() => {
					$.set_text(text_7, $.get(easing));

					if (option_value !== (option_value = easings[$.get(easing)])) {
						option.value = (option.__value = option_value) ?? '';
					}
				});

				$.append($$anchor, option);
			});

			$.reset(select_1);
			$.init_select(select_1);
			$.reset(label_4);

			var node_8 = $.sibling(label_4, 2);

			OptionToggle(node_8, {
				key: 'flashOnUpdate',
				title: 'enable node indicators flashing when value is updated',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_8 = $.text('flash on update');

					$.append($$anchor, text_8);
				},
				$$slots: { default: true }
			});

			var label_5 = $.sibling(node_8, 2);
			var select_2 = $.sibling($.child(label_5));

			$.init_select(select_2);
			$.reset(label_5);

			var label_6 = $.sibling(label_5, 2);
			var input_4 = $.sibling($.child(label_6));

			$.remove_input_defaults(input_4);
			$.reset(label_6);

			var label_7 = $.sibling(label_6, 2);
			var select_3 = $.sibling($.child(label_7));
			var option_1 = $.child(select_3);

			option_1.value = option_1.__value = false;
			$.next(3);
			$.reset(select_3);
			$.init_select(select_3);
			$.reset(label_7);

			var node_9 = $.sibling(label_7, 2);

			{
				let $0 = $.derived(() => !globalOpts.search);

				OptionToggle(node_9, {
					get disabled() {
						return $.get($0);
					},
					key: 'highlightMatches',
					title: 'highlight matches',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_9 = $.text('highlight matches');

						$.append($$anchor, text_9);
					},
					$$slots: { default: true }
				});
			}

			$.reset(div_3);
			$.bind_this(div_3, ($$value) => $.set(bodyEle, $$value), () => $.get(bodyEle));
			$.reset(div);

			$.template_effect(() => {
				$.set_class(
					div,
					1,
					$.clsx([
						'global-options not-content',
						panelState.keepOpen && 'keep-open'
					]),
					'svelte-14mtmgv'
				);

				$.set_class(
					button,
					1,
					$.clsx([
						'tool-button',
						'pin-button',
						panelState.keepOpen ? 'keep-open' : ''
					]),
					'svelte-14mtmgv'
				);

				input_1.disabled = !globalOpts.showPreview;
				input_2.disabled = !globalOpts.showPreview;
			});

			$.delegated('click', button, () => {
				panelState.keepOpen = !panelState.keepOpen;
			});

			$.delegated('click', button_1, () => {
				setGlobalOpts(DEFAULT_OPTIONS);

				if (starlightTheme.current === 'dark') {
					globalOpts.theme = 'inspect';
				} else {
					globalOpts.theme = 'light';
				}
			});

			$.bind_select_value(select, () => globalOpts.theme, ($$value) => globalOpts.theme = $$value);
			$.bind_value(input_1, () => globalOpts.previewDepth, ($$value) => globalOpts.previewDepth = $$value);
			$.bind_value(input_2, () => globalOpts.previewEntries, ($$value) => globalOpts.previewEntries = $$value);
			$.bind_value(input_3, () => globalOpts.animRate, ($$value) => globalOpts.animRate = $$value);
			$.bind_select_value(select_1, () => globalOpts.easing, ($$value) => globalOpts.easing = $$value);
			$.bind_select_value(select_2, () => globalOpts.quotes, ($$value) => globalOpts.quotes = $$value);
			$.bind_value(input_4, () => globalOpts.stringCollapse, ($$value) => globalOpts.stringCollapse = $$value);
			$.bind_select_value(select_3, () => globalOpts.search, ($$value) => globalOpts.search = $$value);
			$.transition(3, div, () => slide, () => ({ duration: 300 }));
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($$props.visible) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);
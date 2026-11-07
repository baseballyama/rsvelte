import 'svelte/internal/disclose-version';
import { writable } from 'svelte/store';
import * as $ from 'svelte/internal/client';
import { onMount, tick } from 'svelte';
import { slide, fade } from 'svelte/transition';
import { dynamic_iframe_srcdoc } from './misc.js';
import { highlightedElement } from '../stores/app/misc';
import { InspectOptionsProvider, Inspect } from 'svelte-inspect-value';
import Icon from '@iconify/svelte';
import { content_editable } from '../utilities';
import { processCode, processCSS } from '../utils';
import { debounce } from 'lodash-es';
import { watch } from 'runed';
import { site_html } from '$lib/builder/stores/app/page.js';
import { onModKey } from '$lib/builder/utils/keyboard';
import * as _ from 'lodash-es';
import { browser } from '$app/environment';
import { current_user } from '$lib/pocketbase/user';

export const has_error = writable(true);
export const auto_refresh = writable(true);
export const preview_updated = writable(true);
export const refresh_preview = writable(() => {});

var root = $.from_html(`<div class="error-body svelte-sjqicf"><code class="svelte-sjqicf"> </code></div>`);
var root_1 = $.from_html(`<div class="error-panel svelte-sjqicf" role="alert" aria-live="polite"><div class="error-header svelte-sjqicf"><span class="error-icon svelte-sjqicf"><!></span> <div class="error-text svelte-sjqicf"><span class="error-title svelte-sjqicf"> </span></div></div> <!></div>`);
var root_2 = $.from_html(`<div class="block-data-content svelte-sjqicf"><!></div>`);
var root_3 = $.from_html(`<div class="block-data svelte-sjqicf"><button class="block-data-header svelte-sjqicf"><div><!></div> <span>Block Data</span></button> <!></div>`);
var root_4 = $.from_html(`<div class="logs svelte-sjqicf"><!></div>`);
var root_5 = $.from_html(`<button class="svelte-sjqicf"><!></button> <button class="svelte-sjqicf"><div class="static-width svelte-sjqicf"> </div></button>`, 1);
var root_6 = $.from_html(`<span class="svelte-sjqicf"><!></span> <span class="svelte-sjqicf"> </span>`, 1);
var root_7 = $.from_html(`<span>static width</span>`);
var root_8 = $.from_html(`<span>dynamic width</span>`);
var root_9 = $.from_html(`<div class="footer-buttons svelte-sjqicf"><div class="preview-width svelte-sjqicf"><!></div> <button class="switch-view svelte-sjqicf"><!> <!></button> <button class="preview-orientation svelte-sjqicf"><!></button> <button title="Toggle auto-refresh (refresh with Command R)"><!></button></div>`);
var root_10 = $.from_html(`<div class="code-preview svelte-sjqicf"><!> <!> <!> <div><iframe tabindex="-1" title="Preview HTML"></iframe></div> <!></div>`);

export default function ComponentPreview($$anchor, $$props) {
	$.push($$props, true);

	const $preview_updated = () => $.store_get(preview_updated, '$preview_updated', $$stores);
	const $has_error = () => $.store_get(has_error, '$has_error', $$stores);
	const $refresh_preview = () => $.store_get(refresh_preview, '$refresh_preview', $$stores);
	const $highlightedElement = () => $.store_get(highlightedElement, '$highlightedElement', $$stores);
	const $auto_refresh = () => $.store_get(auto_refresh, '$auto_refresh', $$stores);
	const $current_user = () => $.store_get(current_user, '$current_user', $$stores);
	const $site_html = () => $.store_get(site_html, '$site_html', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	/**
	 * @typedef {Object} Props
	 * @property {string} [id]
	 * @property {Object} [code]?
	 * @property {string} [view]?
	 * @property {string} [orientation]?
	 * @property {boolean} [loading]?
	 * @property {boolean} [hideControls]?
	 * @property {any} [data]
	 * @property {Array} [fields]?
	 * @property {string | null} [head]?
	 * @property {string} [append]?
	 */
	/** @type {Props} */
	let code = $.prop($$props, 'code', 19, () => ({ html: '', css: '', js: '' })),
		view = $.prop($$props, 'view', 15, 'small'),
		orientation = $.prop($$props, 'orientation', 15, 'horizontal'),
		loading = $.prop($$props, 'loading', 15, false),
		hideControls = $.prop($$props, 'hideControls', 3, false),
		data = $.prop($$props, 'data', 3, undefined),
		fields = $.prop($$props, 'fields', 3, undefined),
		append = $.prop($$props, 'append', 3, '');

	$.store_set(preview_updated, false);

	let compilation_error = $.state(null);
	let error_source = $.state(null);
	let error_token = $.state(0);
	let visible_error = $.state(null);
	let componentApp = $.state(null);
	let component_mounted = $.state(false);
	let quiet_compile = $.state(false);

	async function compile_component_code() {
		if (!code() || !code().html || !data()) return;

		// disable_save = true
		if (!$.get(quiet_compile)) {
			loading(true);
		}

		await compile();

		// disable_save = compilationError
		setTimeout(
			() => {
				if (!$.get(quiet_compile)) {
					loading(false);
				}

				$.set(quiet_compile, false);
			},
			200
		);

		async function compile() {
			const { js, error } = await processCode({
				component: {
					// head: code.head,
					html: code().html || '',
					css: code().css || '',
					js: code().js || '',
					data: data()
				},
				buildStatic: false,
				runtime: ['mount', 'unmount']
			});

			if (error) {
				const message = toErrorMessage(error);

				$.set(compilation_error, message, true);
				$.set(error_source, message.startsWith('CSS Error') ? 'css' : 'compile', true);
				$.set(error_token, $.get(error_token) + 1);
				$.store_set(has_error, true);
			} else {
				$.set(componentApp, js, true);
				$.set(compilation_error, null);
				$.set(error_source, null);
				$.set(error_token, $.get(error_token) + 1);
				$.store_set(has_error, false);
			}
		}
	}

	compile_component_code();

	function toErrorMessage(value) {
		if (typeof value === 'string') return value;

		if (value && typeof value === 'object') {
			const maybeMessage = value.message;

			if (typeof maybeMessage === 'string') {
				return maybeMessage;
			}
		}

		if (value) {
			return String(value);
		}

		return '';
	}

	function formatErrorTitle(source) {
		if (source === 'runtime') return 'Runtime error';
		if (source === 'css') return 'CSS error';
		if (source === 'compile') return 'Build error';

		return 'Component error';
	}

	function decodeHTMLEntities(value) {
		const text = document.createElement('textarea');

		text.innerHTML = value;

		return text.value;
	}

	function normalizeError(message, source) {
		const detail = decodeHTMLEntities(toErrorMessage(message).trim());
		const has_details = !!detail;
		const baseSource = source ?? 'unknown';

		return {
			detail,
			has_details,
			source: baseSource,
			title: formatErrorTitle(baseSource)
		};
	}

	const showErrorAfterPause = debounce(
		(payload) => {
			const normalizedMessage = toErrorMessage(payload.message);

			if (!normalizedMessage.trim()) {
				$.set(visible_error, null);

				return;
			}

			$.set(visible_error, normalizeError(normalizedMessage, payload.source), true);
		},
		350
	);

	watch(
		() => [
			$.get(compilation_error),
			$.get(error_source),
			$.get(error_token)
		],
		([message, source]) => {
			if (!message) {
				showErrorAfterPause.cancel();
				$.set(visible_error, null);

				return;
			}

			showErrorAfterPause({ message, source });
		}
	);

	// Debounce compilation to prevent frequent recompilation during typing
	const debouncedCompile = debounce(compile_component_code, 100);

	// Debounced recompile specifically for data changes while in error state
	const debouncedDataRecompile = debounce(
		() => {
			$.set(quiet_compile, true);
			compile_component_code();
		},
		250
	);

	// Set the refresh_preview store to the debounced compile function
	$.user_effect(() => {
		$.store_set(refresh_preview, setIframeApp);
	});

	// Add Command+R keyboard shortcut to refresh preview
	onModKey('r', setIframeApp);

	let channel;

	onMount(() => {
		channel = new BroadcastChannel(`preview-${$$props.id}`);

		channel.onmessage = ({ data }) => {
			const { event, payload } = data;

			if (event === 'INITIALIZED') {
				$.set(iframe_loaded, true);
			} else if (event === 'BEGIN') {
				$.set(compilation_error, null);
				$.set(error_source, null);
				$.set(error_token, $.get(error_token) + 1);
			} else if (event === 'MOUNTED') {
				$.set(component_mounted, true);
			} else if (event === 'SET_CONSOLE_LOGS') {
				$.set(consoleLog, data.payload.logs, true);
			} else if (event === 'SET_ERROR') {
				const runtimeError = payload?.error ?? 'Unknown runtime error';

				$.set(compilation_error, toErrorMessage(runtimeError), true);
				$.set(error_source, 'runtime');
				$.set(error_token, $.get(error_token) + 1);
				$.store_set(has_error, true);
			} else if (event === 'SET_ELEMENT_PATH' && payload.loc) {
				$.store_set(highlightedElement, payload.loc);
			}
		};

		return () => {
			channel?.close();
		};
	});

	let consoleLog = $.state(void 0);
	let iframe = $.state(void 0);

	function append_to_iframe(code) {
		var container = document.createElement('div');

		container.innerHTML = code;

		Array.from(container.childNodes).forEach((node) => {
			$.get(iframe).contentWindow.document.head.appendChild(node);
		});
	}

	// inject updated component CSS to avoid having to recompile the whole thing on each style change
	// NOTE: this introduces a bug where writing bare styles will target generated HTML (ie from Markdown/RichText) since injected styles aren't scoped
	// but that's an acceptable tradeoff atm for the better UX
	async function update_css(raw_css) {
		if (!$.get(iframe) || !$.get(iframe).contentDocument || !$.get(componentApp)) return;

		const doc = $.get(iframe).contentDocument;

		// if css contains any :global styles, just recompile everything
		if ((/:global/).test(raw_css)) {
			debouncedCompile();
		} else {
			try {
				const final_css = await processCSS(raw_css);

				// remove stale style tag if it exists
				let styleTags = doc.querySelectorAll('style[id^="svelte-"]');

				if (styleTags.length > 1) {
					styleTags[0].remove();
					styleTags[1].textContent = final_css;
				} else {
					styleTags[0].textContent = final_css;
				}

				if ($.get(error_source) === 'css') {
					$.set(compilation_error, null);
					$.set(error_source, null);
					$.set(error_token, $.get(error_token) + 1);
					$.store_set(has_error, false);
				}
			} catch(error) {
				const message = toErrorMessage(error);

				$.set(compilation_error, message.startsWith('CSS Error') ? message : `CSS Error: ${message}`, true);
				$.set(error_source, 'css');
				$.set(error_token, $.get(error_token) + 1);
				$.store_set(has_error, true);
			}
		}
	}

	watch(() => [code().css, $auto_refresh()], ([css, refresh]) => {
		if (!refresh) return;

		update_css(css);
	});

	let container = $.state(void 0);
	let iframe_loaded = $.state(false);
	let scale = $.state(void 0);
	let height = $.state(void 0);

	async function resizePreview() {
		if (view() && $.get(container) && $.get(iframe)) {
			await tick();

			const { clientWidth: parentWidth } = $.get(container);
			const { clientWidth: childWidth } = $.get(iframe);
			const scaleRatio = parentWidth / childWidth;

			$.set(scale, `scale(${scaleRatio})`);
			$.set(height, 100 / scaleRatio + '%');
		}
	}

	function cycle_preview() {
		if ($.get(active_static_width) === static_widths.phone) {
			set_preview(static_widths.tablet);
		} else if ($.get(active_static_width) === static_widths.tablet) {
			set_preview(static_widths.laptop);
		} else if ($.get(active_static_width) === static_widths.laptop) {
			set_preview(static_widths.desktop);
		} else {
			set_preview(static_widths.phone);
		}

		resizePreview();
	}

	function set_preview(size) {
		$.set(active_static_width, size, true);
	}

	async function changeView() {
		if (view() === 'small') {
			view('large');
			resizePreview();
		} else {
			view('small');
		}
	}

	async function setIframeApp() {
		if (!channel) return;

		channel.postMessage({
			event: 'SET_APP',
			payload: { componentApp: $.get(componentApp), data: data() }
		});
	}

	function setIframeData() {
		// When there's a compile error, field edits can spam recompiles and cause flicker.
		// Debounce a quiet recompile attempt, and avoid touching the iframe until success.
		if ($.get(compilation_error) && $auto_refresh()) {
			debouncedDataRecompile();

			return;
		}

		// reload the app if it crashed from an error
		const div = $.get(iframe)?.contentDocument?.querySelector('#page');

		if (div?.innerHTML === '') {
			setIframeApp();
		} else if ($.get(iframe_loaded) && channel) {
			channel.postMessage({ event: 'SET_APP_DATA', payload: { data: data() } });
		}
	}

	let previewWidth = $.state(void 0);

	// Load saved preference or default to true for developers
	const saved_block_data_state = browser ? localStorage.getItem('show_block_data') : null;

	let show_block_data = $.state($.proxy(saved_block_data_state !== null
		? saved_block_data_state === 'true'
		: $current_user()?.siteRole === 'developer'));

	// Save preference when it changes
	$.user_effect(() => {
		if (browser) {
			localStorage.setItem('show_block_data', String($.get(show_block_data)));
		}
	});

	// Order data keys by field index
	const ordered_data = $.derived(() => (() => {
		if (!data() || !fields()) return data();

		// Sort fields by index
		const sorted_fields = [...fields()].sort((a, b) => (a.index || 0) - (b.index || 0));

		// Create new object with keys in field order
		const ordered = {};

		for (const field of sorted_fields) {
			if (field.key && data().hasOwnProperty(field.key)) {
				ordered[field.key] = data()[field.key];
			}
		}

		// Add any remaining keys not in fields
		for (const key in data()) {
			if (!ordered.hasOwnProperty(key)) {
				ordered[key] = data()[key];
			}
		}

		return ordered;
	})());

	const static_widths = { phone: 300, tablet: 600, laptop: 1200, desktop: 1600 };
	let active_static_width = $.state($.proxy(static_widths.laptop));

	function getIcon(width) {
		if (width < static_widths.tablet) {
			return 'bi:phone';
		} else if (width < static_widths.laptop) {
			return 'ant-design:tablet-outlined';
		} else if (width < static_widths.desktop) {
			return 'bi:laptop';
		} else {
			return 'akar-icons:desktop-device';
		}
	}

	function toggleOrientation() {
		if (orientation() === 'vertical') {
			orientation('horizontal');
		} else if (orientation() === 'horizontal') {
			orientation('vertical');
		}
	}

	let last_signature = `${code().html}--${code().js}`;

	watch(() => [code().html, code().js, $auto_refresh()], ([html, js, refresh]) => {
		if (!refresh) return;

		const new_signature = `${html}--${js}`;

		if (new_signature === last_signature) return;

		debouncedCompile();
		last_signature = new_signature;
	});

	$.user_effect(() => {
		if ($.get(iframe)) {
			// open clicked links in browser
			$.get(iframe).contentWindow.document.querySelectorAll('a').forEach((link) => {
				link.target = '_blank';
			});

			append_to_iframe(append());
		}
	});

	watch(() => [$.get(componentApp), $.get(iframe_loaded)], () => {
		if (!$.get(componentApp) || !$.get(iframe_loaded)) return;

		setIframeApp();
	});

	let last_data = _.cloneDeep(data());
	let last_data_keys = Object.keys(data() || {}).sort().join(',');

	watch(() => data(), (data) => {
		if (!data || _.isEqual(last_data, data)) return;

		// Check if new fields have been added (new keys in data object)
		const current_keys = Object.keys(data).sort().join(',');

		const fields_added = current_keys !== last_data_keys;

		if (fields_added) {
			// New fields detected - need to recompile to include them in props
			last_data_keys = current_keys;

			debouncedCompile();
		} else {
			// Just data values changed - update iframe data
			setIframeData();
		}

		last_data = _.cloneDeep(data);
	});

	$.user_effect(() => {
		($.get(previewWidth), resizePreview());
	});

	let active_dynamic_icon = $.derived(() => getIcon($.get(previewWidth)));
	let active_static_icon = $.derived(() => getIcon($.get(active_static_width)));
	var div_1 = root_10();

	$.event('resize', $.window, resizePreview);

	var node_1 = $.child(div_1);

	{
		var consequent_1 = ($$anchor) => {
			var div_2 = root_1();
			var div_3 = $.child(div_2);
			var span = $.child(div_3);
			var node_2 = $.child(span);

			Icon(node_2, { icon: 'mdi:alert-circle-outline', height: '1.25rem' });
			$.reset(span);

			var div_4 = $.sibling(span, 2);
			var span_1 = $.child(div_4);
			var text_1 = $.only_child(span_1, true);

			$.reset(div_4);
			$.reset(div_3);

			var node_3 = $.sibling(div_3, 2);

			{
				var consequent = ($$anchor) => {
					var div_5 = root();
					var code_1 = $.child(div_5);
					var text_2 = $.only_child(code_1, true);

					$.reset(div_5);
					$.template_effect(() => $.set_text(text_2, $.get(visible_error)?.detail));
					$.append($$anchor, div_5);
				};

				$.if(node_3, ($$render) => {
					if ($.get(visible_error)?.has_details) $$render(consequent);
				});
			}

			$.reset(div_2);
			$.template_effect(() => $.set_text(text_1, $.get(visible_error).title));
			$.transition(3, div_2, () => slide, () => ({ duration: 120 }));
			$.append($$anchor, div_2);
		};

		$.if(node_1, ($$render) => {
			if ($.get(visible_error)) $$render(consequent_1);
		});
	}

	var node_4 = $.sibling(node_1, 2);

	{
		var consequent_3 = ($$anchor) => {
			var div_6 = root_3();
			var button = $.child(div_6);
			var div_7 = $.child(button);
			let classes;
			var node_5 = $.child(div_7);

			Icon(node_5, { icon: 'lucide:chevron-right', height: '1rem' });
			$.reset(div_7);
			$.next(2);
			$.reset(button);

			var node_6 = $.sibling(button, 2);

			{
				var consequent_2 = ($$anchor) => {
					var div_8 = root_2();
					var node_7 = $.child(div_8);

					InspectOptionsProvider(node_7, {
						options: {
							theme: 'dark',
							borderless: true,
							noanimate: true,
							showTools: false
						},

						children: ($$anchor, $$slotProps) => {
							var fragment = $.comment();
							var node_8 = $.first_child(fragment);

							$.component(node_8, () => Inspect.Values, ($$anchor, Inspect_Values) => {
								Inspect_Values($$anchor, $.spread_props(() => $.get(ordered_data)));
							});

							$.append($$anchor, fragment);
						},
						$$slots: { default: true }
					});

					$.reset(div_8);
					$.transition(3, div_8, () => slide, () => ({ duration: 100 }));
					$.append($$anchor, div_8);
				};

				$.if(node_6, ($$render) => {
					if ($.get(show_block_data)) $$render(consequent_2);
				});
			}

			$.reset(div_6);
			$.template_effect(() => classes = $.set_class(div_7, 1, 'chevron svelte-sjqicf', null, classes, { rotated: $.get(show_block_data) }));
			$.delegated('click', button, () => $.set(show_block_data, !$.get(show_block_data)));
			$.append($$anchor, div_6);
		};

		var d = $.derived(() => $current_user()?.siteRole === 'developer' && data() && Object.keys(data()).length > 0);

		$.if(node_4, ($$render) => {
			if ($.get(d)) $$render(consequent_3);
		});
	}

	var node_9 = $.sibling(node_4, 2);

	{
		var consequent_4 = ($$anchor) => {
			var div_9 = root_4();
			var node_10 = $.child(div_9);

			Inspect(node_10, {
				get value() {
					return $.get(consoleLog);
				},
				theme: 'dark',
				borderless: true,
				noanimate: true,
				showTools: false
			});

			$.reset(div_9);
			$.transition(3, div_9, () => slide);
			$.append($$anchor, div_9);
		};

		$.if(node_9, ($$render) => {
			if ($.get(consoleLog)) $$render(consequent_4);
		});
	}

	var div_10 = $.sibling(node_9, 2);
	let classes_1;
	var iframe_1 = $.child(div_10);
	let classes_2;
	let styles;

	$.bind_this(iframe_1, ($$value) => $.set(iframe, $$value), () => $.get(iframe));
	$.reset(div_10);
	$.bind_this(div_10, ($$value) => $.set(container, $$value), () => $.get(container));

	var node_11 = $.sibling(div_10, 2);

	{
		var consequent_9 = ($$anchor) => {
			var div_11 = root_9();
			var div_12 = $.child(div_11);
			var node_12 = $.child(div_12);

			{
				var consequent_5 = ($$anchor) => {
					var fragment_1 = root_5();
					var button_1 = $.first_child(fragment_1);
					var node_13 = $.child(button_1);

					Icon(node_13, {
						get icon() {
							return $.get(active_static_icon);
						},
						height: '1rem'
					});

					$.reset(button_1);

					var button_2 = $.sibling(button_1, 2);
					var div_13 = $.child(button_2);
					var text_3 = $.only_child(div_13, true);

					$.action(div_13, ($$node, $$action_arg) => content_editable?.($$node, $$action_arg), () => ({
						on_change: (e) => {
							$.set(active_static_width, Number(e.target.textContent), true);
							resizePreview();
						}
					}));

					$.reset(button_2);
					$.template_effect(() => $.set_text(text_3, $.get(active_static_width)));
					$.delegated('click', button_1, cycle_preview);
					$.append($$anchor, fragment_1);
				};

				var alternate = ($$anchor) => {
					var fragment_2 = root_6();
					var span_2 = $.first_child(fragment_2);
					var node_14 = $.child(span_2);

					Icon(node_14, {
						get icon() {
							return $.get(active_dynamic_icon);
						},
						height: '1rem'
					});

					$.reset(span_2);

					var span_3 = $.sibling(span_2, 2);
					var text_4 = $.only_child(span_3, true);

					$.template_effect(() => $.set_text(text_4, $.get(previewWidth)));
					$.append($$anchor, fragment_2);
				};

				$.if(node_12, ($$render) => {
					if (view() === 'large') $$render(consequent_5); else $$render(alternate, -1);
				});
			}

			$.reset(div_12);

			var button_3 = $.sibling(div_12, 2);
			var node_15 = $.child(button_3);

			{
				let $0 = $.derived(() => view() === 'small'
					? 'fa-solid:compress-arrows-alt'
					: 'fa-solid:expand-arrows-alt');

				Icon(node_15, {
					get icon() {
						return $.get($0);
					}
				});
			}

			var node_16 = $.sibling(node_15, 2);

			{
				var consequent_6 = ($$anchor) => {
					var span_4 = root_7();

					$.append($$anchor, span_4);
				};

				var alternate_1 = ($$anchor) => {
					var span_5 = root_8();

					$.append($$anchor, span_5);
				};

				$.if(node_16, ($$render) => {
					if (view() === 'large') $$render(consequent_6); else $$render(alternate_1, -1);
				});
			}

			$.reset(button_3);

			var button_4 = $.sibling(button_3, 2);
			var node_17 = $.child(button_4);

			{
				var consequent_7 = ($$anchor) => {
					Icon($$anchor, { icon: 'charm:layout-rows' });
				};

				var consequent_8 = ($$anchor) => {
					Icon($$anchor, { icon: 'charm:layout-columns' });
				};

				$.if(node_17, ($$render) => {
					if (orientation() === 'vertical') $$render(consequent_7); else if (orientation() === 'horizontal') $$render(consequent_8, 1);
				});
			}

			$.reset(button_4);

			var button_5 = $.sibling(button_4, 2);
			let classes_3;
			var node_18 = $.child(button_5);

			Icon(node_18, { icon: 'bx:refresh' });
			$.reset(button_5);
			$.reset(div_11);
			$.template_effect(() => classes_3 = $.set_class(button_5, 1, 'auto-refresh svelte-sjqicf', null, classes_3, { toggled: $auto_refresh() }));
			$.delegated('click', button_3, changeView);
			$.delegated('click', button_4, toggleOrientation);
			$.delegated('click', button_5, () => $.store_set(auto_refresh, !$auto_refresh()));
			$.append($$anchor, div_11);
		};

		$.if(node_11, ($$render) => {
			if (!hideControls()) $$render(consequent_9);
		});
	}

	$.reset(div_1);

	$.template_effect(
		($0) => {
			classes_1 = $.set_class(div_10, 1, 'preview-container svelte-sjqicf', null, classes_1, { loading: loading() });
			$.set_attribute(iframe_1, 'srcdoc', $0);
			classes_2 = $.set_class(iframe_1, 1, 'svelte-sjqicf', null, classes_2, { fadein: $.get(component_mounted) });

			styles = $.set_style(iframe_1, '', styles, {
				transform: view() === 'large' ? $.get(scale) : '',
				height: view() === 'large' ? $.get(height) : '100%',
				width: view() === 'large' ? `${$.get(active_static_width)}px` : '100%'
			});
		},
		[
			() => dynamic_iframe_srcdoc($site_html(), `preview-${$$props.id}`)
		]
	);

	$.transition(1, div_10, () => fade);
	$.bind_element_size(div_10, 'clientWidth', ($$value) => $.set(previewWidth, $$value));
	$.append($$anchor, div_1);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);
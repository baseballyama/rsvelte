import * as $ from 'svelte/internal/server';
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
import { writable } from 'svelte/store';

export const has_error = writable(true);
export const auto_refresh = writable(true);
export const preview_updated = writable(true);
export const refresh_preview = writable(() => {});

export default function ComponentPreview($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

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
		let {
			id,
			code = { html: '', css: '', js: '' },
			view = 'small',
			orientation = 'horizontal',
			loading = false,
			hideControls = false,
			data = undefined,
			fields = undefined,
			append = ''
		} = $$props;

		$.store_set(preview_updated, false);

		let compilation_error = null;
		let error_source = null;
		let error_token = 0;
		let visible_error = null;
		let componentApp = null;
		let component_mounted = false;
		let quiet_compile = false;

		async function compile_component_code() {
			if (!code || !code.html || !data) return;

			// disable_save = true
			if (!quiet_compile) {
				loading = true;
			}

			await compile();

			// disable_save = compilationError
			setTimeout(
				() => {
					if (!quiet_compile) {
						loading = false;
					}

					quiet_compile = false;
				},
				200
			);

			async function compile() {
				const { js, error } = await processCode({
					component: {
						// head: code.head,
						html: code.html || '',
						css: code.css || '',
						js: code.js || '',
						data
					},
					buildStatic: false,
					runtime: ['mount', 'unmount']
				});

				if (error) {
					const message = toErrorMessage(error);

					compilation_error = message;
					error_source = message.startsWith('CSS Error') ? 'css' : 'compile';
					error_token = error_token + 1;
					$.store_set(has_error, true);
				} else {
					componentApp = js;
					compilation_error = null;
					error_source = null;
					error_token = error_token + 1;
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
					visible_error = null;

					return;
				}

				visible_error = normalizeError(normalizedMessage, payload.source);
			},
			350
		);

		watch(() => [compilation_error, error_source, error_token], ([message, source]) => {
			if (!message) {
				showErrorAfterPause.cancel();
				visible_error = null;

				return;
			}

			showErrorAfterPause({ message, source });
		});

		// Debounce compilation to prevent frequent recompilation during typing
		const debouncedCompile = debounce(compile_component_code, 100);

		// Debounced recompile specifically for data changes while in error state
		const debouncedDataRecompile = debounce(
			() => {
				quiet_compile = true;
				compile_component_code();
			},
			250
		);

		// Set the refresh_preview store to the debounced compile function
		// Add Command+R keyboard shortcut to refresh preview
		onModKey('r', setIframeApp);

		let channel;

		onMount(() => {
			channel = new BroadcastChannel(`preview-${id}`);

			channel.onmessage = ({ data }) => {
				const { event, payload } = data;

				if (event === 'INITIALIZED') {
					iframe_loaded = true;
				} else if (event === 'BEGIN') {
					compilation_error = null;
					error_source = null;
					error_token = error_token + 1;
				} else if (event === 'MOUNTED') {
					component_mounted = true;
				} else if (event === 'SET_CONSOLE_LOGS') {
					consoleLog = data.payload.logs;
				} else if (event === 'SET_ERROR') {
					const runtimeError = payload?.error ?? 'Unknown runtime error';

					compilation_error = toErrorMessage(runtimeError);
					error_source = 'runtime';
					error_token = error_token + 1;
					$.store_set(has_error, true);
				} else if (event === 'SET_ELEMENT_PATH' && payload.loc) {
					$.store_set(highlightedElement, payload.loc);
				}
			};

			return () => {
				channel?.close();
			};
		});

		let consoleLog = void 0;
		let iframe = void 0;

		function append_to_iframe(code) {
			var container = document.createElement('div');

			container.innerHTML = code;

			Array.from(container.childNodes).forEach((node) => {
				iframe.contentWindow.document.head.appendChild(node);
			});
		}

		// inject updated component CSS to avoid having to recompile the whole thing on each style change
		// NOTE: this introduces a bug where writing bare styles will target generated HTML (ie from Markdown/RichText) since injected styles aren't scoped
		// but that's an acceptable tradeoff atm for the better UX
		async function update_css(raw_css) {
			if (!iframe || !iframe.contentDocument || !componentApp) return;

			const doc = iframe.contentDocument;

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

					if (error_source === 'css') {
						compilation_error = null;
						error_source = null;
						error_token = error_token + 1;
						$.store_set(has_error, false);
					}
				} catch(error) {
					const message = toErrorMessage(error);

					compilation_error = message.startsWith('CSS Error') ? message : `CSS Error: ${message}`;
					error_source = 'css';
					error_token = error_token + 1;
					$.store_set(has_error, true);
				}
			}
		}

		watch(
			() => [
				code.css,
				$.store_get($$store_subs ??= {}, '$auto_refresh', auto_refresh)
			],
			([css, refresh]) => {
				if (!refresh) return;

				update_css(css);
			}
		);

		let container = void 0;
		let iframe_loaded = false;
		let scale = void 0;
		let height = void 0;

		async function resizePreview() {
			if (view && container && iframe) {
				await tick();

				const { clientWidth: parentWidth } = container;
				const { clientWidth: childWidth } = iframe;
				const scaleRatio = parentWidth / childWidth;

				scale = `scale(${scaleRatio})`;
				height = 100 / scaleRatio + '%';
			}
		}

		function cycle_preview() {
			if (active_static_width === static_widths.phone) {
				set_preview(static_widths.tablet);
			} else if (active_static_width === static_widths.tablet) {
				set_preview(static_widths.laptop);
			} else if (active_static_width === static_widths.laptop) {
				set_preview(static_widths.desktop);
			} else {
				set_preview(static_widths.phone);
			}

			resizePreview();
		}

		function set_preview(size) {
			active_static_width = size;
		}

		async function changeView() {
			if (view === 'small') {
				view = 'large';
				resizePreview();
			} else {
				view = 'small';
			}
		}

		async function setIframeApp() {
			if (!channel) return;

			channel.postMessage({ event: 'SET_APP', payload: { componentApp, data } });
		}

		function setIframeData() {
			// When there's a compile error, field edits can spam recompiles and cause flicker.
			// Debounce a quiet recompile attempt, and avoid touching the iframe until success.
			if (compilation_error && $.store_get($$store_subs ??= {}, '$auto_refresh', auto_refresh)) {
				debouncedDataRecompile();

				return;
			}

			// reload the app if it crashed from an error
			const div = iframe?.contentDocument?.querySelector('#page');

			if (div?.innerHTML === '') {
				setIframeApp();
			} else if (iframe_loaded && channel) {
				channel.postMessage({ event: 'SET_APP_DATA', payload: { data } });
			}
		}

		let previewWidth = void 0;

		// Load saved preference or default to true for developers
		const saved_block_data_state = browser ? localStorage.getItem('show_block_data') : null;

		let show_block_data = saved_block_data_state !== null
			? saved_block_data_state === 'true'
			: $.store_get($$store_subs ??= {}, '$current_user', current_user)?.siteRole === 'developer';

		// Save preference when it changes
		// Order data keys by field index
		const ordered_data = $.derived(() => (() => {
			if (!data || !fields) return data;

			// Sort fields by index
			const sorted_fields = [...fields].sort((a, b) => (a.index || 0) - (b.index || 0));

			// Create new object with keys in field order
			const ordered = {};

			for (const field of sorted_fields) {
				if (field.key && data.hasOwnProperty(field.key)) {
					ordered[field.key] = data[field.key];
				}
			}

			// Add any remaining keys not in fields
			for (const key in data) {
				if (!ordered.hasOwnProperty(key)) {
					ordered[key] = data[key];
				}
			}

			return ordered;
		})());

		const static_widths = { phone: 300, tablet: 600, laptop: 1200, desktop: 1600 };
		let active_static_width = static_widths.laptop;

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
			if (orientation === 'vertical') {
				orientation = 'horizontal';
			} else if (orientation === 'horizontal') {
				orientation = 'vertical';
			}
		}

		let last_signature = `${code.html}--${code.js}`;

		watch(
			() => [
				code.html,
				code.js,
				$.store_get($$store_subs ??= {}, '$auto_refresh', auto_refresh)
			],
			([html, js, refresh]) => {
				if (!refresh) return;

				const new_signature = `${html}--${js}`;

				if (new_signature === last_signature) return;

				debouncedCompile();
				last_signature = new_signature;
			}
		);

		// open clicked links in browser
		watch(() => [componentApp, iframe_loaded], () => {
			if (!componentApp || !iframe_loaded) return;

			setIframeApp();
		});

		let last_data = _.cloneDeep(data);
		let last_data_keys = Object.keys(data || {}).sort().join(',');

		watch(() => data, (data) => {
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

		let active_dynamic_icon = $.derived(() => getIcon(previewWidth));
		let active_static_icon = $.derived(() => getIcon(active_static_width));

		$$renderer.push(`<div class="code-preview svelte-sjqicf">`);

		if (visible_error) {
			$$renderer.push(`<!--[0--><div class="error-panel svelte-sjqicf" role="alert" aria-live="polite"><div class="error-header svelte-sjqicf"><span class="error-icon svelte-sjqicf">`);
			Icon($$renderer, { icon: 'mdi:alert-circle-outline', height: '1.25rem' });
			$$renderer.push(`<!----></span> <div class="error-text svelte-sjqicf"><span class="error-title svelte-sjqicf">${$.escape(visible_error.title)}</span></div></div> `);

			if (visible_error?.has_details) {
				$$renderer.push(`<!--[0--><div class="error-body svelte-sjqicf"><code class="svelte-sjqicf">${$.escape(visible_error?.detail)}</code></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if ($.store_get($$store_subs ??= {}, '$current_user', current_user)?.siteRole === 'developer' && data && Object.keys(data).length > 0) {
			$$renderer.push(`<!--[0--><div class="block-data svelte-sjqicf"><button class="block-data-header svelte-sjqicf"><div${$.attr_class('chevron svelte-sjqicf', void 0, { 'rotated': show_block_data })}>`);
			Icon($$renderer, { icon: 'lucide:chevron-right', height: '1rem' });
			$$renderer.push(`<!----></div> <span>Block Data</span></button> `);

			if (show_block_data) {
				$$renderer.push(`<!--[0--><div class="block-data-content svelte-sjqicf">`);

				InspectOptionsProvider($$renderer, {
					options: {
						theme: 'dark',
						borderless: true,
						noanimate: true,
						showTools: false
					},

					children: ($$renderer) => {
						if (Inspect.Values) {
							$$renderer.push('<!--[-->');
							Inspect.Values($$renderer, $.spread_props([ordered_data()]));
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (consoleLog) {
			$$renderer.push(`<!--[0--><div class="logs svelte-sjqicf">`);

			Inspect($$renderer, {
				value: consoleLog,
				theme: 'dark',
				borderless: true,
				noanimate: true,
				showTools: false
			});

			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div${$.attr_class('preview-container svelte-sjqicf', void 0, { 'loading': loading })}><iframe tabindex="-1" title="Preview HTML"${$.attr('srcdoc', dynamic_iframe_srcdoc($.store_get($$store_subs ??= {}, '$site_html', site_html), `preview-${id}`))}${$.attr_class('svelte-sjqicf', void 0, { 'fadein': component_mounted })}${$.attr_style('', {
			transform: view === 'large' ? scale : '',
			height: view === 'large' ? height : '100%',
			width: view === 'large' ? `${active_static_width}px` : '100%'
		})}></iframe></div> `);

		if (!hideControls) {
			$$renderer.push(`<!--[0--><div class="footer-buttons svelte-sjqicf"><div class="preview-width svelte-sjqicf">`);

			if (view === 'large') {
				$$renderer.push(`<!--[0--><button class="svelte-sjqicf">`);
				Icon($$renderer, { icon: active_static_icon(), height: '1rem' });
				$$renderer.push(`<!----></button> <button class="svelte-sjqicf"><div class="static-width svelte-sjqicf">${$.escape(active_static_width)}</div></button>`);
			} else {
				$$renderer.push(`<!--[-1--><span class="svelte-sjqicf">`);
				Icon($$renderer, { icon: active_dynamic_icon(), height: '1rem' });
				$$renderer.push(`<!----></span> <span class="svelte-sjqicf">${$.escape(previewWidth)}</span>`);
			}

			$$renderer.push(`<!--]--></div> <button class="switch-view svelte-sjqicf">`);

			Icon($$renderer, {
				icon: view === 'small'
					? 'fa-solid:compress-arrows-alt'
					: 'fa-solid:expand-arrows-alt'
			});

			$$renderer.push(`<!----> `);

			if (view === 'large') {
				$$renderer.push(`<!--[0--><span>static width</span>`);
			} else {
				$$renderer.push(`<!--[-1--><span>dynamic width</span>`);
			}

			$$renderer.push(`<!--]--></button> <button class="preview-orientation svelte-sjqicf">`);

			if (orientation === 'vertical') {
				$$renderer.push('<!--[0-->');
				Icon($$renderer, { icon: 'charm:layout-rows' });
			} else if (orientation === 'horizontal') {
				$$renderer.push('<!--[1-->');
				Icon($$renderer, { icon: 'charm:layout-columns' });
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></button> <button title="Toggle auto-refresh (refresh with Command R)"${$.attr_class('auto-refresh svelte-sjqicf', void 0, {
				'toggled': $.store_get($$store_subs ??= {}, '$auto_refresh', auto_refresh)
			})}>`);

			Icon($$renderer, { icon: 'bx:refresh' });
			$$renderer.push(`<!----></button></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { view, orientation, loading });
	});
}
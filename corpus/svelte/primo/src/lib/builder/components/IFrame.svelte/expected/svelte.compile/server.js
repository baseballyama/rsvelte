import * as $ from 'svelte/internal/server';
import { onDestroy } from 'svelte';
import Icon from '@iconify/svelte';
import { tick } from 'svelte';
import { static_iframe_srcdoc } from './misc';
import * as _ from 'lodash-es';
import { watch, useResizeObserver } from 'runed';

export default function IFrame($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * @typedef {Object} Props
		 * @property {any} [componentCode]
		 * @property {any} [height]
		 * @property {string | null} [srcdoc]
		 * @property {string | null} [head]
		 * @property {string} [append]
		 */
		/** @type {Props} */
		let { componentCode, height = void 0, srcdoc = '', head = '' } = $$props;

		let container = void 0;
		let iframe = void 0;
		let iframe_loaded = false;
		let finished_resizing = false;

		function set_height() {
			if (!iframe?.contentWindow?.document?.body) return;

			const body = iframe.contentWindow.document.body;
			const newHeight = body.scrollHeight * scaleRatio;

			height = newHeight;
			container_height = body.scrollHeight;
			finished_resizing = true;
		}

		function set_scale_ratio() {
			if (!container || !iframe) return;

			const { clientWidth: parentWidth } = container;
			const { clientWidth: childWidth } = iframe;

			scaleRatio = parentWidth / childWidth;
		}

		let scaleRatio = 1;
		let container_height = void 0;
		let load_observer = void 0;
		let resize_observer = void 0;
		let iframe_body = null;

		function sync_iframe_size() {
			if (!container || !iframe) return;
			if (!iframe?.contentDocument?.body) return;

			set_scale_ratio();
			set_height();
		}

		// observe changes in component height to sync scaled height/ratio
		// mostly useful to updating in response to images loading in
		useResizeObserver(() => iframe_body, sync_iframe_size);

		// Set srcdoc from component code
		let generated_srcdoc = '';

		let active_code = {};
		let active_head = '';

		watch(() => componentCode, (code) => {
			if (_.isEqual(active_code, code) || !code) {
				return;
			}

			generated_srcdoc = static_iframe_srcdoc({ head: head + code.head, html: code.body, css: code.css

			// foot: append
			 });

			active_code = _.cloneDeep(code);
		});

		// Sync the iframe size (ratio & height) on initial load
		watch(() => iframe_loaded, (loaded) => {
			if (!loaded) return;

			iframe_body = iframe?.contentDocument?.body ?? null;

			if (!iframe_body) return;

			tick().then(sync_iframe_size);
		});

		// Append site HEAD code to iframe head
		watch(() => ({ iframe_loaded, head }), ({ loaded, head }) => {
			if (!loaded || !head) return;
			if (active_head === head) return;

			var container = document.createElement('div');

			container.innerHTML = head;

			Array.from(container.childNodes).forEach((node) => {
				iframe.contentWindow.document.head.appendChild(node);
			});

			active_head = head;
		});

		// listen to sidebar resizing to update scale ratio
		watch(() => ({ container, iframe }), ({ container, iframe }) => {
			if (!container || !iframe) return;
			if (load_observer) load_observer.disconnect();
			if (resize_observer) resize_observer.disconnect();

			const sidebar = container.closest('.sidebar');

			if (sidebar) {
				resize_observer = new ResizeObserver(set_scale_ratio).observe(sidebar);

				load_observer = new ResizeObserver(() => {
					// workaround for on:load not working reliably
					if (iframe?.contentWindow?.document?.body?.childNodes) {
						set_scale_ratio();
					}
				}).observe(iframe);
			}
		});

		onDestroy(() => {
			if (load_observer) load_observer.disconnect();
			if (resize_observer) resize_observer.disconnect();
		});

		$$renderer.push(`<div class="IFrame svelte-1yiye7s">`);

		if (!iframe_loaded) {
			$$renderer.push(`<!--[0--><div class="spinner-container svelte-1yiye7s">`);
			Icon($$renderer, { icon: 'eos-icons:three-dots-loading' });
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="iframe-container svelte-1yiye7s"${$.attr_style('', { height: `${$.stringify(container_height * scaleRatio)}px` })}>`);

		if (generated_srcdoc || srcdoc) {
			$$renderer.push(`<!--[0--><iframe scrolling="no" title="Preview HTML"${$.attr('srcdoc', generated_srcdoc || srcdoc)}${$.attr_class('svelte-1yiye7s', void 0, { 'fadein': finished_resizing })}${$.attr_style('', {
				transform: `scale(${$.stringify(scaleRatio)})`,
				height: 100 / scaleRatio + '%'
			})} onload="this.__e=event"></iframe>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div>`);
		$.bind_props($$props, { height });
	});
}
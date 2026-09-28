import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onDestroy } from 'svelte';
import Icon from '@iconify/svelte';
import { tick } from 'svelte';
import { static_iframe_srcdoc } from './misc';
import * as _ from 'lodash-es';
import { watch, useResizeObserver } from 'runed';

var root = $.from_html(`<div class="spinner-container svelte-1yiye7s"><!></div>`);
var root_1 = $.from_html(`<iframe scrolling="no" title="Preview HTML"></iframe>`);
var root_2 = $.from_html(`<div class="IFrame svelte-1yiye7s"><!> <div class="iframe-container svelte-1yiye7s"><!></div></div>`);

export default function IFrame($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * @typedef {Object} Props
	 * @property {any} [componentCode]
	 * @property {any} [height]
	 * @property {string | null} [srcdoc]
	 * @property {string | null} [head]
	 * @property {string} [append]
	 */
	/** @type {Props} */
	let height = $.prop($$props, 'height', 15),
		srcdoc = $.prop($$props, 'srcdoc', 3, ''),
		head = $.prop($$props, 'head', 3, '');

	let container = $.state(void 0);
	let iframe = $.state(void 0);
	let iframe_loaded = $.state(false);
	let finished_resizing = $.state(false);

	function set_height() {
		if (!$.get(iframe)?.contentWindow?.document?.body) return;

		const body = $.get(iframe).contentWindow.document.body;
		const newHeight = body.scrollHeight * $.get(scaleRatio);

		height(newHeight);
		$.set(container_height, body.scrollHeight, true);
		$.set(finished_resizing, true);
	}

	function set_scale_ratio() {
		if (!$.get(container) || !$.get(iframe)) return;

		const { clientWidth: parentWidth } = $.get(container);
		const { clientWidth: childWidth } = $.get(iframe);

		$.set(scaleRatio, parentWidth / childWidth);
	}

	let scaleRatio = $.state(1);
	let container_height = $.state(void 0);
	let load_observer = $.state(void 0);
	let resize_observer = $.state(void 0);
	let iframe_body = $.state(null);

	function sync_iframe_size() {
		if (!$.get(container) || !$.get(iframe)) return;
		if (!$.get(iframe)?.contentDocument?.body) return;

		set_scale_ratio();
		set_height();
	}

	// observe changes in component height to sync scaled height/ratio
	// mostly useful to updating in response to images loading in
	useResizeObserver(() => $.get(iframe_body), sync_iframe_size);

	// Set srcdoc from component code
	let generated_srcdoc = $.state('');

	let active_code = {};
	let active_head = $.state('');

	watch(() => $$props.componentCode, (code) => {
		if (_.isEqual(active_code, code) || !code) {
			return;
		}

		$.set(
			generated_srcdoc,
			static_iframe_srcdoc({ head: head() + code.head, html: code.body, css: code.css

			// foot: append
			 }),
			true
		);

		active_code = _.cloneDeep(code);
	});

	// Sync the iframe size (ratio & height) on initial load
	watch(() => $.get(iframe_loaded), (loaded) => {
		if (!loaded) return;

		$.set(iframe_body, $.get(iframe)?.contentDocument?.body ?? null, true);

		if (!$.get(iframe_body)) return;

		tick().then(sync_iframe_size);
	});

	// Append site HEAD code to iframe head
	watch(() => ({ iframe_loaded: $.get(iframe_loaded), head: head() }), ({ loaded, head }) => {
		if (!loaded || !head) return;
		if ($.get(active_head) === head) return;

		var container = document.createElement('div');

		container.innerHTML = head;

		Array.from(container.childNodes).forEach((node) => {
			$.get(iframe).contentWindow.document.head.appendChild(node);
		});

		$.set(active_head, head, true);
	});

	// listen to sidebar resizing to update scale ratio
	watch(() => ({ container: $.get(container), iframe: $.get(iframe) }), ({ container, iframe }) => {
		if (!container || !iframe) return;
		if ($.get(load_observer)) $.get(load_observer).disconnect();
		if ($.get(resize_observer)) $.get(resize_observer).disconnect();

		const sidebar = container.closest('.sidebar');

		if (sidebar) {
			$.set(resize_observer, new ResizeObserver(set_scale_ratio).observe(sidebar), true);

			$.set(
				load_observer,
				new ResizeObserver(() => {
					// workaround for on:load not working reliably
					if (iframe?.contentWindow?.document?.body?.childNodes) {
						set_scale_ratio();
					}
				}).observe(iframe),
				true
			);
		}
	});

	onDestroy(() => {
		if ($.get(load_observer)) $.get(load_observer).disconnect();
		if ($.get(resize_observer)) $.get(resize_observer).disconnect();
	});

	var div = root_2();

	$.event('resize', $.window, set_scale_ratio);

	var node_1 = $.child(div);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();
			var node_2 = $.child(div_1);

			Icon(node_2, { icon: 'eos-icons:three-dots-loading' });
			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		$.if(node_1, ($$render) => {
			if (!$.get(iframe_loaded)) $$render(consequent);
		});
	}

	var div_2 = $.sibling(node_1, 2);
	let styles;
	var node_3 = $.child(div_2);

	{
		var consequent_1 = ($$anchor) => {
			var iframe_1 = root_1();
			let classes;
			let styles_1;

			$.bind_this(iframe_1, ($$value) => $.set(iframe, $$value), () => $.get(iframe));

			$.template_effect(() => {
				$.set_attribute(iframe_1, 'srcdoc', $.get(generated_srcdoc) || srcdoc());
				classes = $.set_class(iframe_1, 1, 'svelte-1yiye7s', null, classes, { fadein: $.get(finished_resizing) });

				styles_1 = $.set_style(iframe_1, '', styles_1, {
					transform: `scale(${$.get(scaleRatio) ?? ''})`,
					height: 100 / $.get(scaleRatio) + '%'
				});
			});

			$.event('load', iframe_1, () => {
				$.set(iframe_loaded, true);
			});

			$.replay_events(iframe_1);
			$.append($$anchor, iframe_1);
		};

		$.if(node_3, ($$render) => {
			if ($.get(generated_srcdoc) || srcdoc()) $$render(consequent_1);
		});
	}

	$.reset(div_2);
	$.bind_this(div_2, ($$value) => $.set(container, $$value), () => $.get(container));
	$.reset(div);
	$.template_effect(() => styles = $.set_style(div_2, '', styles, { height: `${$.get(container_height) * $.get(scaleRatio)}px` }));
	$.append($$anchor, div);
	$.pop();
}
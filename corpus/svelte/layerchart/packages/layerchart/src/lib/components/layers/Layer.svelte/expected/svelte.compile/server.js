import * as $ from 'svelte/internal/server';
import Canvas from './Canvas.svelte';
import Svg from './Svg.svelte';
import Html from './Html.svelte';
import Frame from '../Frame/Frame.svelte';
import { getSettings } from '$lib/contexts/settings.js';

export default function Layer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { type, children, $$slots, $$events, ...restProps } = $$props;
		let settings = getSettings();
		let layer = $.derived(() => type ?? settings.layer);

		if (layer() === 'canvas') {
			$$renderer.push('<!--[0-->');

			{
				function children($$renderer, props) {
					if (settings.debug) {
						$$renderer.push('<!--[0-->');
						Frame($$renderer, { class: 'lc-debug-frame' });
						$$renderer.push(`<!----> `);
						Frame($$renderer, { class: 'lc-debug-frame', full: true });
						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);
					children?.($$renderer, props);
					$$renderer.push(`<!---->`);
				}

				Canvas($$renderer, $.spread_props([restProps, { children, $$slots: { default: true } }]));
			}
		} else if (layer() === 'svg') {
			$$renderer.push('<!--[1-->');

			{
				function children($$renderer, props) {
					if (settings.debug) {
						$$renderer.push('<!--[0-->');
						Frame($$renderer, { class: 'lc-debug-frame' });
						$$renderer.push(`<!----> `);
						Frame($$renderer, { class: 'lc-debug-frame', full: true });
						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);
					children?.($$renderer, props);
					$$renderer.push(`<!---->`);
				}

				Svg($$renderer, $.spread_props([restProps, { children, $$slots: { default: true } }]));
			}
		} else if (layer() === 'html') {
			$$renderer.push('<!--[2-->');

			{
				function children($$renderer, props) {
					if (settings.debug) {
						$$renderer.push('<!--[0-->');
						Frame($$renderer, { class: 'lc-debug-frame' });
						$$renderer.push(`<!----> `);
						Frame($$renderer, { class: 'lc-debug-frame', full: true });
						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);
					children?.($$renderer, props);
					$$renderer.push(`<!---->`);
				}

				Html($$renderer, $.spread_props([restProps, { children, $$slots: { default: true } }]));
			}
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}
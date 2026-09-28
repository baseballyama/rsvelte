import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Globe } from 'lucide-svelte';
import { onDestroy, tick } from 'svelte';

var root = $.from_html(`<iframe tabindex="-1" title="site preview"></iframe>`);
var root_1 = $.from_html(`<div class="h-full flex justify-center items-center"><!></div>`);
var root_2 = $.from_html(`<div class="iframe-root bg-gray-900 svelte-d5jpdx"><div class="iframe-container svelte-d5jpdx"><!></div></div>`);

export default function SitePreview($$anchor, $$props) {
	$.push($$props, true);

	let container = $.state(void 0);
	let scale = $.state(void 0);
	let iframeHeight = $.state(void 0);
	let iframe = $.state(void 0);
	let iframeLoaded = $.state(void 0);
	let resize_observer = $.state(void 0);

	async function init_preview() {
		await tick();

		// if (!iframe?.contentWindow?.document?.body) return
		if ($.get(resize_observer)) $.get(resize_observer)?.disconnect();

		$.set(
			resize_observer,
			new ResizeObserver((entries) => {
				const { offsetWidth: parentWidth } = $.get(container);
				const { offsetWidth: childWidth } = $.get(iframe);

				if (parentWidth === 0) return;

				$.set(scale, parentWidth / childWidth);
				$.set(iframeHeight, `${100 / $.get(scale)}%`);

				// give it a sec to load in
				setTimeout(
					() => {
						$.set(iframeLoaded, true);
					},
					200
				);
			}),
			true
		);

		$.get(resize_observer).observe($.get(container));
	}

	function resize_preview() {
		if (!$.get(container) || !$.get(iframe)) return;

		const { clientWidth: parentWidth } = $.get(container);
		const { clientWidth: childWidth } = $.get(iframe);

		$.set(scale, parentWidth / childWidth);
		$.set(iframeHeight, `${100 / $.get(scale)}%`);
	}

	onDestroy(() => {
		$.get(resize_observer)?.disconnect();
	});

	var div = root_2();

	$.event('resize', $.window, resize_preview);

	var div_1 = $.child(div);
	var node = $.child(div_1);

	{
		var consequent = ($$anchor) => {
			var iframe_1 = root();
			let classes;
			let styles;

			$.bind_this(iframe_1, ($$value) => $.set(iframe, $$value), () => $.get(iframe));

			$.template_effect(() => {
				classes = $.set_class(iframe_1, 1, 'w-[1024px] rounded overflow-hidden bg-white svelte-d5jpdx', null, classes, { fadein: $.get(iframeLoaded) });
				$.set_attribute(iframe_1, 'src', $$props.src ?? `/?_site=${$$props.site.id}`);

				styles = $.set_style(iframe_1, '', styles, {
					transform: `scale(${$.get(scale) ?? ''})`,
					height: $.get(iframeHeight)
				});
			});

			$.event('load', iframe_1, async () => {
				await init_preview();
			});

			$.replay_events(iframe_1);
			$.append($$anchor, iframe_1);
		};

		var alternate = ($$anchor) => {
			var div_2 = root_1();
			var node_1 = $.child(div_2);

			Globe(node_1, { color: 'white', size: '5rem' });
			$.reset(div_2);
			$.append($$anchor, div_2);
		};

		$.if(node, ($$render) => {
			if ($$props.site && ($$props.src || $$props.site.preview)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div_1);
	$.bind_this(div_1, ($$value) => $.set(container, $$value), () => $.get(container));
	$.reset(div);
	$.template_effect(() => $.set_style(div, $$props.style));
	$.append($$anchor, div);
	$.pop();
}
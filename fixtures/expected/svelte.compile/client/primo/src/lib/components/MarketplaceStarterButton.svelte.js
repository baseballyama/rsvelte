import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SitePreview from '$lib/components/SitePreview.svelte';
import { ExternalLink } from 'lucide-svelte';
import { Site } from '$lib/common/models/Site';

var root = $.from_html(`<div class="space-y-3 relative w-full aspect-[.69] bg-gray-900"><div class="rounded-tl rounded-tr overflow-hidden"><a target="_blank" rel="noopener noreferrer" class="w-full hover:opacity-75 transition-all block"><!></a></div> <div class="absolute -bottom-2 rounded-bl rounded-br w-full p-3 z-20 bg-gray-900 truncate flex items-center justify-between"><div class="flex items-center gap-2"><div class="text-sm font-medium leading-none"> </div> <div class="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">Free</div></div> <a target="_blank" rel="noopener noreferrer" class="text-xs text-muted-foreground hover:text-foreground hover:underline flex items-center gap-1"><span>Preview</span> <!></a></div></div>`);

export default function MarketplaceStarterButton($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * @typedef {Object} Props
	 * @property {Site} site
	 * @property {any} [preview]
	 * @property {string} [append]
	 */
	/** @type {Props} */
	let preview = $.prop($$props, 'preview', 11, null),
		append = $.prop($$props, 'append', 3, '');

	let container = void 0;
	let scale = $.state(void 0);
	let iframeHeight = $.state(void 0);
	let iframe = void 0;

	function resizePreview() {
		const { clientWidth: parentWidth } = container;
		const { clientWidth: childWidth } = iframe;

		$.set(scale, parentWidth / childWidth);
		$.set(iframeHeight, `${100 / $.get(scale)}%`);
	}

	function append_to_iframe(code) {
		var container = document.createElement('div');

		// Set the innerHTML of the container to your HTML string
		container.innerHTML = code;

		// Append each element in the container to the document head
		Array.from(container.childNodes).forEach((node) => {
			iframe.contentWindow.document.body.appendChild(node);
		});
	}

	// wait for processor to load before building preview
	let processorLoaded = false;

	setTimeout(
		() => {
			processorLoaded = true;
		},
		500
	);

	$.user_effect(() => {
		iframe && append_to_iframe(append());
	});

	var div = root();

	$.event('resize', $.window, resizePreview);

	var div_1 = $.child(div);
	var a = $.child(div_1);
	var node_1 = $.child(a);

	{
		let $0 = $.derived(() => `https://${$$props.site.host}`);

		SitePreview(node_1, {
			get site() {
				return $$props.site;
			},
			style: '--thumbnail-height: 140%',
			get src() {
				return $.get($0);
			}
		});
	}

	$.reset(a);
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var div_3 = $.child(div_2);
	var div_4 = $.child(div_3);
	var text = $.only_child(div_4, true);

	$.next(2);
	$.reset(div_3);

	var a_1 = $.sibling(div_3, 2);
	var node_2 = $.sibling($.child(a_1), 2);

	ExternalLink(node_2, { class: 'h-3 w-3' });
	$.reset(a_1);
	$.reset(div_2);
	$.reset(div);

	$.template_effect(() => {
		$.set_attribute(a, 'href', `https://${$$props.site.host}`);
		$.set_text(text, $$props.site.name);
		$.set_attribute(a_1, 'href', `https://${$$props.site.host}`);
	});

	$.append($$anchor, div);
	$.pop();
}
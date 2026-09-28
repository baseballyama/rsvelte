import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/elements/forms/button.svelte';
import CloudDark from './cloud-dark.svg';
import CloudLight from './cloud-light.svg';
import HashnodeDark from './hashnode-dark.svg';
import HashnodeLight from './hashnode-light.svg';
import Badge from './hackathon-badge.svg';
import { base } from '$app/paths';
import { Tooltip } from '@appwrite.io/pink-svelte';

var root = $.from_html(`<img height="200" width="200" alt="hackathon-badge"/>`);
var root_1 = $.from_html(`<span slot="tooltip">Join the hackathon to unlock this badge</span>`);
var root_2 = $.from_html(`<div class="wrapper svelte-mj406v"><section class="ht-cta svelte-mj406v"><h1 class="heading-level-1 ht-title text svelte-mj406v">Join Our <br/> <span class="ht-title-primary">Cloud Hackathon</span></h1> <ol class="numeric-list svelte-mj406v"><li class="numeric-list-item"><span class="text">Build an open-source app using Appwrite Cloud</span></li> <li class="numeric-list-item"><span class="text">Publish an article on your Hashnode blog</span></li> <li class="numeric-list-item"><span class="text">Submit your project on <a class="link" href="https://builtwith.appwrite.io" target="_blank" rel="noopener noreferrer">Built with Appwrite</a></span></li></ol> <div class="u-margin-block-start-32 u-flex u-gap-16"><!> <!></div> <div class="ht-logos svelte-mj406v"><div class="u-only-light buttons-list"></div> <ul class="inline-links"><li class="inline-links-item" style="padding-inline-start: 0;"><div class="u-only-light"><img alt="Appwrite Cloud" height="15" width="170"/></div> <div class="u-only-dark"><img alt="Appwrite Cloud" height="15" width="170"/></div></li> <li class="inline-links-item"><div class="u-only-light"><img alt="Hashnode" height="17" width="99"/></div> <div class="u-only-dark"><img alt="Hashnode" height="17" width="99"/></div></li></ul></div></section> <section class="ht-img svelte-mj406v"><div class="card ht-card ht-card-main u-flex u-cross-center u-main-center svelte-mj406v"><!></div> <div class="card ht-card u-flex u-flex-vertical svelte-mj406v"><div class="ht-tag ht-tag-primary u-cross-child-center svelte-mj406v"><span class=" u-uppercase eyebrow-heading-3 svelte-mj406v">Grand winner</span></div> <h4 class="u-flex u-cross-center u-gap-4 u-margin-block-start-20 svelte-mj406v"><span class="heading-level-4">5,000</span><span class="heading-level-7">USD</span></h4> <div class="u-flex u-flex-vertical u-gap-8 u-margin-block-start-16 svelte-mj406v"><p class="ht-text svelte-mj406v">+ Appwrite swag</p> <p class="ht-text svelte-mj406v">+ Hashnode T-shirt & mug</p></div></div> <div class="card ht-card u-flex u-flex-vertical svelte-mj406v"><div class="ht-tag u-cross-child-center svelte-mj406v"><span class=" u-uppercase eyebrow-heading-3 u-bold svelte-mj406v">5 Runner-ups Each</span></div> <h4 class="u-flex u-cross-center u-gap-4 u-margin-block-start-20 svelte-mj406v"><span class="heading-level-4">1,000</span><span class="heading-level-7">USD</span></h4> <div class="u-flex u-flex-vertical u-gap-8 u-margin-block-start-16 svelte-mj406v"><p class="ht-text svelte-mj406v">+ Appwrite swag</p> <p class="ht-text svelte-mj406v">+ Hashnode T-shirt</p></div></div></section></div>`);

export default function _page($$anchor) {
	var div = root_2();

	$.head('mj406v', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Appwrite Cloud - Join Our Hackathon';
		});
	});

	var section = $.child(div);
	var div_1 = $.sibling($.child(section), 4);
	var node = $.child(div_1);

	Button(node, {
		external: true,
		get href() {
			return base;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Go to console');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		secondary: true,
		external: true,
		href: 'https://hashnode.com/hackathons/appwrite?utm_campaign=Cloud%20public%20Beta&utm_content=248635813&utm_medium=social&utm_source=twitter&hss_channel=tw-806598100764807170#participate',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('More details');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var ul = $.sibling($.child(div_2), 2);
	var li = $.child(ul);
	var div_3 = $.child(li);
	var img = $.only_child(div_3);
	var div_4 = $.sibling(div_3, 2);
	var img_1 = $.only_child(div_4);

	$.reset(li);

	var li_1 = $.sibling(li, 2);
	var div_5 = $.child(li_1);
	var img_2 = $.only_child(div_5);
	var div_6 = $.sibling(div_5, 2);
	var img_3 = $.only_child(div_6);

	$.reset(li_1);
	$.reset(ul);
	$.reset(div_2);
	$.reset(section);

	var section_1 = $.sibling(section, 2);
	var div_7 = $.child(section_1);
	var node_2 = $.child(div_7);

	Tooltip(node_2, {
		children: ($$anchor, $$slotProps) => {
			var img_4 = root();

			$.template_effect(() => $.set_attribute(img_4, 'src', Badge));
			$.append($$anchor, img_4);
		},

		$$slots: {
			default: true,
			tooltip: ($$anchor, $$slotProps) => {
				var span = root_1();

				$.append($$anchor, span);
			}
		}
	});

	$.reset(div_7);
	$.next(4);
	$.reset(section_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_attribute(img, 'src', CloudLight);
		$.set_attribute(img_1, 'src', CloudDark);
		$.set_attribute(img_2, 'src', HashnodeLight);
		$.set_attribute(img_3, 'src', HashnodeDark);
	});

	$.append($$anchor, div);
}
import * as $ from 'svelte/internal/server';
import Button from '$lib/elements/forms/button.svelte';
import CloudDark from './cloud-dark.svg';
import CloudLight from './cloud-light.svg';
import HashnodeDark from './hashnode-dark.svg';
import HashnodeLight from './hashnode-light.svg';
import Badge from './hackathon-badge.svg';
import { base } from '$app/paths';
import { Tooltip } from '@appwrite.io/pink-svelte';

export default function _page($$renderer) {
	$.head('mj406v', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Appwrite Cloud - Join Our Hackathon</title>`);
		});
	});

	$$renderer.push(`<div class="wrapper svelte-mj406v"><section class="ht-cta svelte-mj406v"><h1 class="heading-level-1 ht-title text svelte-mj406v">Join Our <br/> <span class="ht-title-primary">Cloud Hackathon</span></h1> <ol class="numeric-list svelte-mj406v"><li class="numeric-list-item"><span class="text">Build an open-source app using Appwrite Cloud</span></li> <li class="numeric-list-item"><span class="text">Publish an article on your Hashnode blog</span></li> <li class="numeric-list-item"><span class="text">Submit your project on <a class="link" href="https://builtwith.appwrite.io" target="_blank" rel="noopener noreferrer">Built with Appwrite</a></span></li></ol> <div class="u-margin-block-start-32 u-flex u-gap-16">`);

	Button($$renderer, {
		external: true,
		href: base,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Go to console`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		secondary: true,
		external: true,
		href: 'https://hashnode.com/hackathons/appwrite?utm_campaign=Cloud%20public%20Beta&utm_content=248635813&utm_medium=social&utm_source=twitter&hss_channel=tw-806598100764807170#participate',
		children: ($$renderer) => {
			$$renderer.push(`<!---->More details`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="ht-logos svelte-mj406v"><div class="u-only-light buttons-list"></div> <ul class="inline-links"><li class="inline-links-item" style="padding-inline-start: 0;"><div class="u-only-light"><img${$.attr('src', CloudLight)} alt="Appwrite Cloud" height="15" width="170"/></div> <div class="u-only-dark"><img${$.attr('src', CloudDark)} alt="Appwrite Cloud" height="15" width="170"/></div></li> <li class="inline-links-item"><div class="u-only-light"><img${$.attr('src', HashnodeLight)} alt="Hashnode" height="17" width="99"/></div> <div class="u-only-dark"><img${$.attr('src', HashnodeDark)} alt="Hashnode" height="17" width="99"/></div></li></ul></div></section> <section class="ht-img svelte-mj406v"><div class="card ht-card ht-card-main u-flex u-cross-center u-main-center svelte-mj406v">`);

	Tooltip($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<img height="200" width="200"${$.attr('src', Badge)} alt="hackathon-badge"/>`);
		},

		$$slots: {
			default: true,
			tooltip: ($$renderer) => {
				$$renderer.push(`<span slot="tooltip">Join the hackathon to unlock this badge</span>`);
			}
		}
	});

	$$renderer.push(`<!----></div> <div class="card ht-card u-flex u-flex-vertical svelte-mj406v"><div class="ht-tag ht-tag-primary u-cross-child-center svelte-mj406v"><span class="u-uppercase eyebrow-heading-3 svelte-mj406v">Grand winner</span></div> <h4 class="u-flex u-cross-center u-gap-4 u-margin-block-start-20 svelte-mj406v"><span class="heading-level-4">5,000</span><span class="heading-level-7">USD</span></h4> <div class="u-flex u-flex-vertical u-gap-8 u-margin-block-start-16 svelte-mj406v"><p class="ht-text svelte-mj406v">+ Appwrite swag</p> <p class="ht-text svelte-mj406v">+ Hashnode T-shirt &amp; mug</p></div></div> <div class="card ht-card u-flex u-flex-vertical svelte-mj406v"><div class="ht-tag u-cross-child-center svelte-mj406v"><span class="u-uppercase eyebrow-heading-3 u-bold svelte-mj406v">5 Runner-ups Each</span></div> <h4 class="u-flex u-cross-center u-gap-4 u-margin-block-start-20 svelte-mj406v"><span class="heading-level-4">1,000</span><span class="heading-level-7">USD</span></h4> <div class="u-flex u-flex-vertical u-gap-8 u-margin-block-start-16 svelte-mj406v"><p class="ht-text svelte-mj406v">+ Appwrite swag</p> <p class="ht-text svelte-mj406v">+ Hashnode T-shirt</p></div></div></section></div>`);
}
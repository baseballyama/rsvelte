import * as $ from 'svelte/internal/server';
import logo from '$lib/assets/logo/svelte-bits-icon-logo.svg';
import FeatureIcon from './FeatureIcon.svelte';

export default function CategorySelector($$renderer) {
	$$renderer.push(`<div class="ln-feat-orbit"><div class="ln-feat-orbit-center"><img${$.attr('src', logo)} alt="" aria-hidden="true"/></div> <div class="ln-feat-orbit-ring ln-feat-orbit-ring--1"><div class="ln-feat-orbit-node ln-feat-orbit-node--top">`);
	FeatureIcon($$renderer, { name: 'type' });
	$$renderer.push(`<!----></div> <div class="ln-feat-orbit-node ln-feat-orbit-node--right">`);
	FeatureIcon($$renderer, { name: 'code' });
	$$renderer.push(`<!----></div> <div class="ln-feat-orbit-node ln-feat-orbit-node--bottom">`);
	FeatureIcon($$renderer, { name: 'layers' });
	$$renderer.push(`<!----></div> <div class="ln-feat-orbit-node ln-feat-orbit-node--left">`);
	FeatureIcon($$renderer, { name: 'grid' });
	$$renderer.push(`<!----></div></div> <div class="ln-feat-orbit-ring ln-feat-orbit-ring--2"><div class="ln-feat-orbit-node ln-feat-orbit-node--top">`);
	FeatureIcon($$renderer, { name: 'zap' });
	$$renderer.push(`<!----></div> <div class="ln-feat-orbit-node ln-feat-orbit-node--tr">`);
	FeatureIcon($$renderer, { name: 'star' });
	$$renderer.push(`<!----></div> <div class="ln-feat-orbit-node ln-feat-orbit-node--right">`);
	FeatureIcon($$renderer, { name: 'circle' });
	$$renderer.push(`<!----></div> <div class="ln-feat-orbit-node ln-feat-orbit-node--br">`);
	FeatureIcon($$renderer, { name: 'eye' });
	$$renderer.push(`<!----></div> <div class="ln-feat-orbit-node ln-feat-orbit-node--bottom">`);
	FeatureIcon($$renderer, { name: 'box' });
	$$renderer.push(`<!----></div> <div class="ln-feat-orbit-node ln-feat-orbit-node--bl">`);
	FeatureIcon($$renderer, { name: 'heart' });
	$$renderer.push(`<!----></div> <div class="ln-feat-orbit-node ln-feat-orbit-node--left">`);
	FeatureIcon($$renderer, { name: 'image' });
	$$renderer.push(`<!----></div> <div class="ln-feat-orbit-node ln-feat-orbit-node--tl">`);
	FeatureIcon($$renderer, { name: 'compass' });
	$$renderer.push(`<!----></div></div></div>`);
}
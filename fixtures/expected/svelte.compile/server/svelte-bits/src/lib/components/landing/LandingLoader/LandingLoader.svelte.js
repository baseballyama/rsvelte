import * as $ from 'svelte/internal/server';
import logo from '$lib/assets/logo/svelte-bits-logo.svg';
import './LandingLoader.css';

export default function LandingLoader($$renderer, $$props) {
	let { hiding = false } = $$props;

	$$renderer.push(`<div${$.attr_class(`ln-loader ${hiding ? 'ln-loader--hide' : ''}`)}><span class="ln-loader-logo" aria-hidden="true"><img${$.attr('src', logo)} alt=""/></span></div>`);
}
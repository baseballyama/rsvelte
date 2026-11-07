import * as $ from 'svelte/internal/server';

export default function FeatureIcon($$renderer, $$props) {
	const { name, size = 16, strokeWidth = 2 } = $$props;

	if (name === 'palette') {
		$$renderer.push(`<!--[0--><svg${$.attr('width', size)}${$.attr('height', size)} viewBox="0 0 24 24" fill="none" stroke="currentColor"${$.attr('stroke-width', strokeWidth)} stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"></circle><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"></circle><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path></svg>`);
	} else if (name === 'shapes') {
		$$renderer.push(`<!--[1--><svg${$.attr('width', size)}${$.attr('height', size)} viewBox="0 0 24 24" fill="none" stroke="currentColor"${$.attr('stroke-width', strokeWidth)} stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8.3 10a.7.7 0 0 1-.626-1.079L11.4 3a.7.7 0 0 1 1.198-.043L16.3 8.9a.7.7 0 0 1-.572 1.1Z"></path><rect x="3" y="14" width="7" height="7" rx="1"></rect><circle cx="17.5" cy="17.5" r="3.5"></circle></svg>`);
	} else if (name === 'image') {
		$$renderer.push(`<!--[2--><svg${$.attr('width', size)}${$.attr('height', size)} viewBox="0 0 24 24" fill="none" stroke="currentColor"${$.attr('stroke-width', strokeWidth)} stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`);
	} else if (name === 'type') {
		$$renderer.push(`<!--[3--><svg${$.attr('width', size)}${$.attr('height', size)} viewBox="0 0 24 24" fill="none" stroke="currentColor"${$.attr('stroke-width', strokeWidth)} stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>`);
	} else if (name === 'circle') {
		$$renderer.push(`<!--[4--><svg${$.attr('width', size)}${$.attr('height', size)} viewBox="0 0 24 24" fill="none" stroke="currentColor"${$.attr('stroke-width', strokeWidth)} stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle></svg>`);
	} else if (name === 'layers') {
		$$renderer.push(`<!--[5--><svg${$.attr('width', size)}${$.attr('height', size)} viewBox="0 0 24 24" fill="none" stroke="currentColor"${$.attr('stroke-width', strokeWidth)} stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>`);
	} else if (name === 'code') {
		$$renderer.push(`<!--[6--><svg${$.attr('width', size)}${$.attr('height', size)} viewBox="0 0 24 24" fill="none" stroke="currentColor"${$.attr('stroke-width', strokeWidth)} stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`);
	} else if (name === 'grid') {
		$$renderer.push(`<!--[7--><svg${$.attr('width', size)}${$.attr('height', size)} viewBox="0 0 24 24" fill="none" stroke="currentColor"${$.attr('stroke-width', strokeWidth)} stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`);
	} else if (name === 'zap') {
		$$renderer.push(`<!--[8--><svg${$.attr('width', size)}${$.attr('height', size)} viewBox="0 0 24 24" fill="none" stroke="currentColor"${$.attr('stroke-width', strokeWidth)} stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`);
	} else if (name === 'box') {
		$$renderer.push(`<!--[9--><svg${$.attr('width', size)}${$.attr('height', size)} viewBox="0 0 24 24" fill="none" stroke="currentColor"${$.attr('stroke-width', strokeWidth)} stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`);
	} else if (name === 'star') {
		$$renderer.push(`<!--[10--><svg${$.attr('width', size)}${$.attr('height', size)} viewBox="0 0 24 24" fill="none" stroke="currentColor"${$.attr('stroke-width', strokeWidth)} stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`);
	} else if (name === 'heart') {
		$$renderer.push(`<!--[11--><svg${$.attr('width', size)}${$.attr('height', size)} viewBox="0 0 24 24" fill="none" stroke="currentColor"${$.attr('stroke-width', strokeWidth)} stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`);
	} else if (name === 'eye') {
		$$renderer.push(`<!--[12--><svg${$.attr('width', size)}${$.attr('height', size)} viewBox="0 0 24 24" fill="none" stroke="currentColor"${$.attr('stroke-width', strokeWidth)} stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`);
	} else if (name === 'compass') {
		$$renderer.push(`<!--[13--><svg${$.attr('width', size)}${$.attr('height', size)} viewBox="0 0 24 24" fill="none" stroke="currentColor"${$.attr('stroke-width', strokeWidth)} stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}
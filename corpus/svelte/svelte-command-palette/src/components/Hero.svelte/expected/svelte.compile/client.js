import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<section class="hero svelte-juboms"><div class="hero-glow svelte-juboms"></div> <div class="hero-content stagger svelte-juboms"><div class="hero-badge svelte-juboms"><span class="badge">✨ Now with Svelte 5 support</span></div> <h1 class="hero-title svelte-juboms">The <span class="text-gradient">Command Palette</span><br/> Your Users Deserve</h1> <p class="hero-description svelte-juboms">A beautiful, accessible, and fully customizable command palette for Svelte applications. 
			Boost productivity with keyboard shortcuts and fuzzy search.</p> <div class="hero-actions svelte-juboms"><button class="btn btn-primary btn-lg svelte-juboms"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg> Try it now <span class="kbd-group svelte-juboms"><kbd class="kbd svelte-juboms">⌘</kbd> <kbd class="kbd svelte-juboms">K</kbd></span></button> <a href="/docs" class="btn btn-secondary btn-lg svelte-juboms">Read the docs <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"></path></svg></a></div> <div class="hero-stats svelte-juboms"><div class="stat svelte-juboms"><span class="stat-value svelte-juboms">5KB</span> <span class="stat-label svelte-juboms">Gzipped</span></div> <div class="stat-divider svelte-juboms"></div> <div class="stat svelte-juboms"><span class="stat-value svelte-juboms">A11y</span> <span class="stat-label svelte-juboms">Accessible</span></div> <div class="stat-divider svelte-juboms"></div> <div class="stat svelte-juboms"><span class="stat-value svelte-juboms">100%</span> <span class="stat-label svelte-juboms">TypeScript</span></div></div></div> <div class="hero-visual animate-fade-in svelte-juboms"><div class="demo-window svelte-juboms"><div class="demo-header svelte-juboms"><div class="demo-dots svelte-juboms"><span class="svelte-juboms"></span> <span class="svelte-juboms"></span> <span class="svelte-juboms"></span></div> <span class="demo-title svelte-juboms">Command Palette</span></div> <div class="demo-content svelte-juboms"><div class="demo-search svelte-juboms"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg> <span class="svelte-juboms">Search for actions...</span> <kbd class="kbd">Esc</kbd></div> <div class="demo-results svelte-juboms"><div class="demo-result active svelte-juboms"><span class="demo-result-icon svelte-juboms">🚀</span> <div class="demo-result-content svelte-juboms"><span class="demo-result-title svelte-juboms">Deploy to production</span> <span class="demo-result-subtitle svelte-juboms">Push changes to live server</span></div> <div class="demo-result-kbd svelte-juboms"><kbd class="kbd">D</kbd> <kbd class="kbd">P</kbd></div></div> <div class="demo-result svelte-juboms"><span class="demo-result-icon svelte-juboms">🎨</span> <div class="demo-result-content svelte-juboms"><span class="demo-result-title svelte-juboms">Toggle dark mode</span> <span class="demo-result-subtitle svelte-juboms">Switch between light and dark</span></div> <div class="demo-result-kbd svelte-juboms"><kbd class="kbd">⌘</kbd> <kbd class="kbd">D</kbd></div></div> <div class="demo-result svelte-juboms"><span class="demo-result-icon svelte-juboms">📦</span> <div class="demo-result-content svelte-juboms"><span class="demo-result-title svelte-juboms">Install dependencies</span> <span class="demo-result-subtitle svelte-juboms">Run npm install</span></div> <div class="demo-result-kbd svelte-juboms"><kbd class="kbd">I</kbd> <kbd class="kbd">D</kbd></div></div></div></div></div></div></section>`);

export default function Hero($$anchor, $$props) {
	let openCommandPalette = $.prop($$props, 'openCommandPalette', 3, () => {});
	var section = root();
	var div = $.sibling($.child(section), 2);
	var div_1 = $.sibling($.child(div), 6);
	var button = $.child(div_1);

	$.next(2);
	$.reset(div_1);
	$.next(2);
	$.reset(div);
	$.next(2);
	$.reset(section);

	$.delegated('click', button, function (...$$args) {
		openCommandPalette()?.apply(this, $$args);
	});

	$.append($$anchor, section);
}

$.delegate(['click']);
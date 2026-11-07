import * as $ from 'svelte/internal/server';

export default function Thumbnail($$renderer, $$props) {
	let { title, description, component } = $$props;

	$$renderer.push(`<div style="display: flex; flex-direction: column; width: 100%; height: 100%; padding: 64px; background: linear-gradient(135deg, #1e1b4b, #312e81, #4338ca); font-family: Inter;"><div style="display: flex; flex-direction: column; flex: 1;"><div style="display: flex; align-items: center; margin-bottom: 40px; gap: 16px;"><span style="display: flex; font-size: 30px; font-weight: 700; color: white;">LayerChart</span> `);

	if (component) {
		$$renderer.push(`<!--[0--><span style="display: flex; padding: 4px 16px; border-radius: 9999px; font-size: 18px; color: white; background: rgba(255,255,255,0.15);">${$.escape(component)}</span>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></div> <p style="display: flex; margin-bottom: 24px; font-size: 72px; font-weight: 700; color: white;">${$.escape(title)}</p> `);

	if (description) {
		$$renderer.push(`<!--[0--><p style="display: flex; max-width: 900px; font-size: 28px; color: white; opacity: 0.8; line-height: 1.4;">${$.escape(description)}</p>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> <div style="display: flex; flex: 1;"></div> <div style="display: flex; justify-content: space-between; font-size: 22px; color: rgba(255,255,255,0.6);"><span style="display: flex;">Composable Svelte visualization library</span> <span style="display: flex;">layerchart.com</span></div></div></div>`);
}
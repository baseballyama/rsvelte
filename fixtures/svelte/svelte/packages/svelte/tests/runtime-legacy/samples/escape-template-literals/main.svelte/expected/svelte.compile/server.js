import * as $ from 'svelte/internal/server';
import Widget from './Widget.svelte';

export default function Main($$renderer) {
	$$renderer.push(`<code>\`\${foo}\\n\`</code> ${$.html("`")} <div title="\`\${foo}\\n\`">foo</div> `);
	Widget($$renderer, { value: '`${foo}\\n`' });

	$$renderer.push(`<!----> <div>/ $clicks: 0 \`tim$es\` \\</div> <div>$dollars \`backticks\` pyramid /\\</div> <p>\${
	\${
	\${</p>`);
}
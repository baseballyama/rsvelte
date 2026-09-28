import * as $ from 'svelte/internal/server';
import SEOComponent from "$lib/seo/SEO.svelte";
import DocsPageShell from "$lib/components/layout/DocsPageShell.svelte";
import { H2, H3, Paragraph, Steps, Step, Link, Blockquote, Divider } from "$lib/components/markdown/index";
import { docsV2PageMap } from "$lib/config/docs-v2";
import DocsCodeBlock from "$lib/web/docs/DocsCodeBlock.svelte";

export default function _page($$renderer) {
	DocsPageShell($$renderer, {
		title: 'MCP Server',
		description: 'Set up jsrepo MCP server for Cursor and Windsurf workflows.',
		children: ($$renderer) => {
			$$renderer.push(`<section class="space-y-4">`);

			H2($$renderer, {
				id: 'cursor-setup',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Cursor Setup`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Steps($$renderer, {
				children: ($$renderer) => {
					Step($$renderer, {
						title: 'Create or update `.cursor/mcp.json`',
						children: ($$renderer) => {
							DocsCodeBlock($$renderer, {
								fileName: '.cursor/mcp.json',
								code: `{
  "mcpServers": {
    "jsrepo": {
      "command": "npx",
      "args": ["jsrepo", "mcp"]
    }
  }
}`,
								lang: 'json'
							});
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></section> <section class="space-y-4">`);

			H2($$renderer, {
				id: 'windsurf-setup',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Windsurf Setup`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Steps($$renderer, {
				children: ($$renderer) => {
					Step($$renderer, {
						title: 'Create or update `.codeium/windsurf/mcp_config.json`',
						children: ($$renderer) => {
							DocsCodeBlock($$renderer, {
								fileName: '.codeium/windsurf/mcp_config.json',
								code: `{
  "mcpServers": {
    "jsrepo": {
      "command": "npx",
      "args": ["jsrepo", "mcp"]
    }
  }
}`,
								lang: 'json'
							});
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></section> `);
			Divider($$renderer, {});
			$$renderer.push(`<!----> <section>`);

			H2($$renderer, {
				id: 'run-server',
				class: 'mb-2',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Run MCP Server`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			DocsCodeBlock($$renderer, {
				fileName: 'Terminal',
				code: `npm install -g jsrepo
jsrepo mcp`,
				lang: 'bash'
			});

			$$renderer.push(`<!----></section>`);
		},
		$$slots: { default: true }
	});
}
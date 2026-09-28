import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SEOComponent from "$lib/seo/SEO.svelte";
import DocsPageShell from "$lib/components/layout/DocsPageShell.svelte";
import { H2, H3, Paragraph, Steps, Step, Link, Blockquote, Divider } from "$lib/components/markdown/index";
import { docsV2PageMap } from "$lib/config/docs-v2";
import DocsCodeBlock from "$lib/web/docs/DocsCodeBlock.svelte";

var root = $.from_html(`<section class="space-y-4"><!> <!></section> <section class="space-y-4"><!> <!></section> <!> <section><!> <!></section>`, 1);

export default function _page($$anchor) {
	// const pageMeta = docsV2PageMap.mcp;
	DocsPageShell($$anchor, {
		title: 'MCP Server',
		description: 'Set up jsrepo MCP server for Cursor and Windsurf workflows.',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var section = $.first_child(fragment_1);
			var node = $.child(section);

			H2(node, {
				id: 'cursor-setup',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Cursor Setup');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Steps(node_1, {
				children: ($$anchor, $$slotProps) => {
					Step($$anchor, {
						title: 'Create or update `.cursor/mcp.json`',
						children: ($$anchor, $$slotProps) => {
							DocsCodeBlock($$anchor, {
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

			$.reset(section);

			var section_1 = $.sibling(section, 2);
			var node_2 = $.child(section_1);

			H2(node_2, {
				id: 'windsurf-setup',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Windsurf Setup');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Steps(node_3, {
				children: ($$anchor, $$slotProps) => {
					Step($$anchor, {
						title: 'Create or update `.codeium/windsurf/mcp_config.json`',
						children: ($$anchor, $$slotProps) => {
							DocsCodeBlock($$anchor, {
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

			$.reset(section_1);

			var node_4 = $.sibling(section_1, 2);

			Divider(node_4, {});

			var section_2 = $.sibling(node_4, 2);
			var node_5 = $.child(section_2);

			H2(node_5, {
				id: 'run-server',
				class: 'mb-2',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Run MCP Server');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_5, 2);

			DocsCodeBlock(node_6, {
				fileName: 'Terminal',
				code: `npm install -g jsrepo
jsrepo mcp`,
				lang: 'bash'
			});

			$.reset(section_2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}
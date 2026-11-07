import * as $ from 'svelte/internal/server';
import BoldIcon from '@lucide/svelte/icons/bold';
import CodeIcon from '@lucide/svelte/icons/code';
import Heading1Icon from '@lucide/svelte/icons/heading-1';
import Heading2Icon from '@lucide/svelte/icons/heading-2';
import Heading3Icon from '@lucide/svelte/icons/heading-3';
import ItalicIcon from '@lucide/svelte/icons/italic';
import LinkIcon from '@lucide/svelte/icons/link';
import MessageCircleIcon from '@lucide/svelte/icons/message-circle';
import PencilIcon from '@lucide/svelte/icons/pencil';
import StrikethroughIcon from '@lucide/svelte/icons/strikethrough';
import { ToggleGroup } from '@skeletonlabs/skeleton-svelte';

export default function _page($$renderer) {
	$$renderer.push(`<div class="space-y-10"><header><h2 class="h2">App Bar</h2></header> <section class="space-y-4">`);

	ToggleGroup($$renderer, {
		defaultValue: ['center'],
		multiple: true,
		children: ($$renderer) => {
			if (ToggleGroup.Item) {
				$$renderer.push('<!--[-->');

				ToggleGroup.Item($$renderer, {
					value: 'left',
					children: ($$renderer) => {
						BoldIcon($$renderer, { class: 'size-4' });
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (ToggleGroup.Item) {
				$$renderer.push('<!--[-->');

				ToggleGroup.Item($$renderer, {
					value: 'center',
					children: ($$renderer) => {
						ItalicIcon($$renderer, { class: 'size-4' });
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (ToggleGroup.Item) {
				$$renderer.push('<!--[-->');

				ToggleGroup.Item($$renderer, {
					value: 'right',
					children: ($$renderer) => {
						StrikethroughIcon($$renderer, { class: 'size-4' });
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></section> <section class="space-y-4"><h3 class="h3">Normalized</h3> <div class="grid grid-cols-[auto_auto_1fr] items-center gap-4"><button type="button" class="btn preset-filled-primary-500">Button</button> `);

	ToggleGroup($$renderer, {
		defaultValue: ['center'],
		multiple: true,
		children: ($$renderer) => {
			if (ToggleGroup.Item) {
				$$renderer.push('<!--[-->');

				ToggleGroup.Item($$renderer, {
					value: 'left',
					children: ($$renderer) => {
						BoldIcon($$renderer, { class: 'size-4' });
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (ToggleGroup.Item) {
				$$renderer.push('<!--[-->');

				ToggleGroup.Item($$renderer, {
					value: 'center',
					children: ($$renderer) => {
						ItalicIcon($$renderer, { class: 'size-4' });
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (ToggleGroup.Item) {
				$$renderer.push('<!--[-->');

				ToggleGroup.Item($$renderer, {
					value: 'right',
					children: ($$renderer) => {
						StrikethroughIcon($$renderer, { class: 'size-4' });
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <input type="text" class="input" placeholder="Example"/></div></section> <section class="space-y-4"><h3 class="h3">Toolbar</h3> <div class="inline-flex gap-2 preset-outlined-surface-200-800 p-2 rounded-base">`);

	ToggleGroup($$renderer, {
		multiple: true,
		children: ($$renderer) => {
			if (ToggleGroup.Item) {
				$$renderer.push('<!--[-->');

				ToggleGroup.Item($$renderer, {
					value: 'left',
					children: ($$renderer) => {
						BoldIcon($$renderer, { class: 'size-4' });
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (ToggleGroup.Item) {
				$$renderer.push('<!--[-->');

				ToggleGroup.Item($$renderer, {
					value: 'center',
					children: ($$renderer) => {
						ItalicIcon($$renderer, { class: 'size-4' });
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (ToggleGroup.Item) {
				$$renderer.push('<!--[-->');

				ToggleGroup.Item($$renderer, {
					value: 'right',
					children: ($$renderer) => {
						StrikethroughIcon($$renderer, { class: 'size-4' });
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	ToggleGroup($$renderer, {
		children: ($$renderer) => {
			if (ToggleGroup.Item) {
				$$renderer.push('<!--[-->');

				ToggleGroup.Item($$renderer, {
					value: 'h1',
					children: ($$renderer) => {
						Heading1Icon($$renderer, { class: 'size-4' });
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (ToggleGroup.Item) {
				$$renderer.push('<!--[-->');

				ToggleGroup.Item($$renderer, {
					value: 'h2',
					children: ($$renderer) => {
						Heading2Icon($$renderer, { class: 'size-4' });
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (ToggleGroup.Item) {
				$$renderer.push('<!--[-->');

				ToggleGroup.Item($$renderer, {
					value: 'h3',
					children: ($$renderer) => {
						Heading3Icon($$renderer, { class: 'size-4' });
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	ToggleGroup($$renderer, {
		children: ($$renderer) => {
			if (ToggleGroup.Item) {
				$$renderer.push('<!--[-->');

				ToggleGroup.Item($$renderer, {
					value: 'edit',
					children: ($$renderer) => {
						PencilIcon($$renderer, { class: 'size-4' });
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (ToggleGroup.Item) {
				$$renderer.push('<!--[-->');

				ToggleGroup.Item($$renderer, {
					value: 'code',
					children: ($$renderer) => {
						CodeIcon($$renderer, { class: 'size-4' });
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (ToggleGroup.Item) {
				$$renderer.push('<!--[-->');

				ToggleGroup.Item($$renderer, {
					value: 'link',
					children: ($$renderer) => {
						LinkIcon($$renderer, { class: 'size-4' });
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (ToggleGroup.Item) {
				$$renderer.push('<!--[-->');

				ToggleGroup.Item($$renderer, {
					value: 'comment',
					children: ($$renderer) => {
						MessageCircleIcon($$renderer, { class: 'size-4' });
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <button type="button" class="btn preset-filled">Export</button></div></section></div>`);
}
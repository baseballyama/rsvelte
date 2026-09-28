import * as $ from 'svelte/internal/server';
import { Story, Template } from '@storybook/addon-svelte-csf';
import { Button } from '@sveltestrap/sveltestrap';
import Offcanvas from './Offcanvas.svelte';

export const meta = {
	title: 'Stories/Offcanvas',
	component: Offcanvas,
	parameters: { controls: { exclude: /^(default)$/g } },
	argTypes: {
		class: { control: false, table: { disable: true } },
		backdrop: { control: 'boolean' },
		body: { control: 'boolean' },
		fade: { control: 'boolean' },
		header: { control: '' },
		isOpen: { control: false, table: { disable: true } },
		keyboard: { control: 'boolean' },
		placement: {
			control: { type: 'select' },
			options: ['start', 'end', 'top', 'bottom']
		},
		scroll: { control: 'boolean' },
		style: { control: '' },
		sm: { control: 'boolean' },
		md: { control: 'boolean' },
		lg: { control: 'boolean' },
		xl: { control: 'boolean' },
		xxl: { control: 'boolean' },
		theme: {
			control: { type: 'select' },
			options: ['dark', 'light', 'auto'],
			description: 'The theme style to apply.',
			table: {
				type: { summary: 'string' },
				defaultValue: { summary: 'auto' }
			}
		},
		'header ': {
			description: 'This is the slot to use for custom headings.',
			table: {
				category: 'slots',
				type: { summary: 'any' },
				defaultValue: { summary: 'empty' }
			}
		},
		'default ': {
			description: 'This is the default content slot.',
			table: {
				category: 'slots',
				type: { summary: 'any' },
				defaultValue: { summary: 'empty' }
			}
		}
	},
	args: {
		backdrop: true,
		body: true,
		class: '',
		container: 'body',
		fade: true,
		header: 'Offcanvas',
		isOpen: false,
		keyboard: true,
		placement: 'start',
		scroll: false,
		sm: false,
		md: false,
		lg: false,
		xl: false,
		xxl: false,
		style: '',
		theme: null,
		toggle: undefined
	}
};

export default function Offcanvas_stories($$renderer) {
	let isOpen = false;
	let status = 'Closed';
	let endOpen = false;
	let bottomOpen = false;
	let topOpen = false;
	const toggleEnd = () => endOpen = !endOpen;
	const toggleBottom = () => bottomOpen = !bottomOpen;
	const toggleTop = () => topOpen = !topOpen;

	const toggle = () => {
		isOpen = !isOpen;
	};

	const basicSource = `<Button color="primary" on:click={toggle}>Open Start</Button>

<Offcanvas {isOpen} {toggle} header="Start">
  Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
  tempor incididunt ut labore et dolore magna aliqua.
</Offcanvas>`;

	Story($$renderer, {
		name: 'Basic',
		source: basicSource,
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { args }) => {
				Button($$renderer, {
					color: 'primary capitalize',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Open ${$.escape(args.placement)}`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Offcanvas($$renderer, $.spread_props([
					args,
					{
						isOpen,
						toggle,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
    aliqua.`);
						},
						$$slots: { default: true }
					}
				]));

				$$renderer.push(`<!---->`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Backdrop',
		children: ($$renderer) => {
			Button($$renderer, {
				color: 'primary',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Open`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Offcanvas($$renderer, {
				header: 'No Backdrop',
				backdrop: false,
				isOpen,
				toggle,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Look ma, no backdrop.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Events',
		children: ($$renderer) => {
			Button($$renderer, {
				color: 'primary',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Open`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <code>  Current state: ${$.escape(status)}</code> `);

			Offcanvas($$renderer, {
				isOpen,
				toggle,
				placement: 'end',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
    aliqua.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Placement',
		children: ($$renderer) => {
			Button($$renderer, {
				color: 'danger',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Start`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				color: 'warning',
				children: ($$renderer) => {
					$$renderer.push(`<!---->End`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				color: 'success',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Top`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				color: 'info',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Bottom`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Offcanvas($$renderer, {
				isOpen,
				toggle,
				header: 'Start',
				placement: 'start',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
    aliqua.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Offcanvas($$renderer, {
				isOpen: endOpen,
				toggle: toggleEnd,
				placement: 'end',
				header: 'Right',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
    aliqua.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Offcanvas($$renderer, {
				isOpen: topOpen,
				toggle: toggleTop,
				placement: 'top',
				header: 'Top',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
    aliqua.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Offcanvas($$renderer, {
				isOpen: bottomOpen,
				toggle: toggleBottom,
				placement: 'bottom',
				header: 'Bottom',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
    aliqua.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Slots',
		children: ($$renderer) => {
			Button($$renderer, {
				color: 'primary',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Open`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Offcanvas($$renderer, {
				scroll: true,
				isOpen,
				toggle,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
    aliqua.`);
				},

				$$slots: {
					default: true,
					header: ($$renderer) => {
						$$renderer.push(`<h1 slot="header"><i>Hello <b>World!</b></i></h1>`);
					}
				}
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Manual',
		children: ($$renderer) => {
			Button($$renderer, {
				color: 'primary',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Open`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Offcanvas($$renderer, {
				header: 'No toggle or esc',
				scroll: true,
				isOpen,
				children: ($$renderer) => {
					Button($$renderer, {
						color: 'danger',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Close Me`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Scrolling',
		children: ($$renderer) => {
			Button($$renderer, {
				color: 'primary',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Open`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Offcanvas($$renderer, {
				header: 'You can scroll the body',
				scroll: true,
				isOpen,
				toggle,
				backdrop: false,
				children: ($$renderer) => {
					$$renderer.push(`<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua.</p> <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua.</p> <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua.</p> <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua.</p> <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua.</p> <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua.</p> <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua.</p> <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua.</p> <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua.</p> <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua.</p> <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua.</p> <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua.</p> <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua.</p> <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua.</p>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Custom',
		children: ($$renderer) => {
			Button($$renderer, {
				color: 'primary',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Open`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Offcanvas($$renderer, {
				isOpen,
				body: false,
				style: 'width: 150px',
				class: 'bg-danger',
				children: ($$renderer) => {
					$$renderer.push(`<div><img src="https://picsum.photos/150/1200" alt="Meaningless content"/></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Theming',
		children: ($$renderer) => {
			Button($$renderer, {
				color: 'dark',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Dark Theme`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				color: 'light',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Light Theme`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Offcanvas($$renderer, {
				theme: 'dark',
				isOpen,
				toggle,
				header: 'Dark Theme',
				placement: 'start',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
    aliqua.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Offcanvas($$renderer, {
				theme: 'light',
				isOpen: endOpen,
				toggle: toggleEnd,
				header: 'Light Theme',
				placement: 'end',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
    aliqua.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}
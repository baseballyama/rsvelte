<script context="module">
  import Tooltip from './Tooltip.svelte';

  export const meta = {
    title: 'Stories/Tooltip',
    component: Tooltip,
    parameters: {
      controls: {
        exclude: /^(default)$/g
      }
    },
    argTypes: {
      class: {
        className: 'string',
        table: { disable: true }
      },
      animation: {
        control: 'boolean'
      },
      content: {
        control: 'text'
      },
      container: {
        control: 'text',
        table: { disable: true }
      },
      delay: {
        control: 'number'
      },
      id: {
        control: 'text',
        table: { disable: true }
      },
      isOpen: {
        control: 'boolean'
      },
      placement: {
        control: {
          type: 'select'
        },
        options: ['top', 'left', 'right', 'bottom']
      },
      target: {
        control: 'text',
        table: { disable: true }
      },
      theme: {
        control: {
          type: 'select'
        },
        options: ['dark', 'light', 'auto'],
        description: 'The theme style to apply.',
        table: {
          type: {
            summary: 'string'
          },
          defaultValue: {
            summary: 'auto'
          }
        }
      },
      'default ': {
        description: 'This is the default content slot.',
        table: {
          category: 'slots',
          type: {
            summary: 'any'
          },
          defaultValue: {
            summary: 'empty'
          }
        }
      }
    },
    args: {
      animation: true,
      content: '',
      container: undefined,
      delay: 0,
      id: '',
      isOpen: false,
      placement: 'top',
      target: ''
    }
  };
</script>

<script>
  import { Story, Template } from '@storybook/addon-svelte-csf';
  import { Button } from '@sveltestrap/sveltestrap';

  const placements = ['top', 'right', 'left', 'bottom'];

  let isOpen = false;

  let myHtmlElementA, myHtmlElementB;
</script>

<Template let:args>
  {#key args}
    <div class="mt-3">
      <Button id={`btn-${args.placement}`} color="primary">Show {args.placement}</Button>
      <Tooltip {...args} target={`btn-${args.placement}`} args.placement>{args.placement} tooltip!</Tooltip>
    </div>
  {/key}
</Template>

<Story name="Basic" />

<Story name="HTML">
  <div>
    <Button id="btn-right-html" color="primary">HTML Tooltips</Button>
    <Tooltip target="btn-right-html" placement="right">
      <strong>Hello</strong> <i>World</i>!
    </Tooltip>
  </div>
</Story>

<Story name="Controlled">
  <div class="tooltip-example">
    <div class="text-content">
      <div class="mt-3">
        <Button id="controlledBtn" color="primary">You could hover here</Button>
        <Tooltip bind:isOpen placement="right" target="controlledBtn" delay="500"
          >This is a Tooltip controlled externally.</Tooltip
        >
        <hr />
        <label>
          <input type="checkbox" bind:checked={isOpen} />
          Or you can check this to control the Tooltip state.
        </label>
      </div>
    </div>
  </div>
</Story>

<Story name="ElementTarget">
  <div class="tooltip-example">
    <div class="tooltip-width">
      <div class="mt-3">
        <div style="background: lightgreen" bind:this={myHtmlElementA}>A</div>
        <Tooltip target={myHtmlElementA} placement="right">A</Tooltip>
      </div>

      <div class="mt-3">
        <div style="background: lightblue" bind:this={myHtmlElementB}>B</div>
        <Tooltip target={myHtmlElementB} placement="right">B</Tooltip>
      </div>
    </div>
  </div>
</Story>

<Story name="Theming">
  <div class="horizontal gap-lg">
    <Button id="btn-dark-theme" color="dark">Dark Theme</Button>
    <Button id="btn-light-theme" color="light">Light Theme</Button>
  </div>

  <Tooltip theme="dark" target="btn-dark-theme" placement="top">
    This a <strong>dark theme</strong> tooltip!
  </Tooltip>

  <Tooltip theme="light" target="btn-light-theme" placement="top">
    This a <strong>light theme</strong> tooltip!
  </Tooltip>
</Story>

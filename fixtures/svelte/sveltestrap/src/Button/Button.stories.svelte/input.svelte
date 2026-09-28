<script context="module">
  import Button from './Button.svelte';

  export const meta = {
    title: 'Stories/Button',
    component: Button,
    parameters: {
      controls: {
        exclude: /^(click|default)$/g
      }
    },
    argTypes: {
      class: {
        control: false,
        table: {
          disable: true
        }
      },
      content: {
        control: ''
      },
      active: {
        control: 'boolean'
      },
      block: {
        control: 'boolean'
      },
      disabled: {
        control: 'boolean'
      },
      close: {
        control: 'boolean'
      },
      outline: {
        control: 'boolean'
      },
      href: {
        control: ''
      },
      value: {
        control: ''
      },
      inner: {
        control: false,
        table: {
          disable: true
        }
      },
      color: {
        control: {
          type: 'select'
        },
        options: ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'link']
      },
      size: {
        control: {
          type: 'select'
        },
        options: ['sm', 'md', 'lg']
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
      class: '',
      active: false,
      block: false,
      content: undefined,
      close: false,
      color: 'secondary',
      disabled: false,
      href: '',
      inner: undefined,
      outline: false,
      size: null,
      value: ''
    }
  };
</script>

<script>
  import { Story, Template } from '@storybook/addon-svelte-csf';
  import { ButtonGroup, ButtonToolbar } from '@sveltestrap/sveltestrap';

  const colors = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'link'];

  const sizesMap = {
    sm: 'Small',
    md: 'Medium',
    lg: 'Large'
  };
</script>

<Template let:args>
  <Button {...args} on:click></Button>
</Template>

<Story name="Basic" args={{ size: 'md', color: 'primary', content: 'Button' }} />

<Story name="Colors" args={{ color: 'primary' }}>
  <div class="horizontal capitalize">
    {#each colors as color}
      <Button class="capitalize" {color}>{color}</Button>
    {/each}
  </div>
</Story>

<Story name="Outlines" args={{ color: 'primary' }}>
  <div class="horizontal">
    {#each colors as color}
      <Button class="capitalize" outline {color}>{color}</Button>
    {/each}
  </div>
</Story>

<Story name="Sizes" args={{ size: 'md' }}>
  <div class="horizontal">
    {#each Object.keys(sizesMap) as size}
      <Button {size} color="primary">{sizesMap[size]}</Button>
    {/each}
  </div>
</Story>

<Story name="Groups">
  <ButtonGroup>
    <Button color="primary" active>Alpha</Button>
    <Button color="primary">Bravo</Button>
    <Button color="primary">Charlie</Button>
  </ButtonGroup>
</Story>

<Story name="Toolbar">
  <ButtonToolbar>
    <ButtonGroup class="me-2">
      <Button color="primary">1</Button>
      <Button color="primary">2</Button>
      <Button color="primary">3</Button>
      <Button color="primary">4</Button>
    </ButtonGroup>
    <ButtonGroup class="me-2">
      <Button color="primary">5</Button>
      <Button color="primary">6</Button>
      <Button color="primary">7</Button>
    </ButtonGroup>
    <ButtonGroup>
      <Button color="primary">8</Button>
    </ButtonGroup>
  </ButtonToolbar>
</Story>

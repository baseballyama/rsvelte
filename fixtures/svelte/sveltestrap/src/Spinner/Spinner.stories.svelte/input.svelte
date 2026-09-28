<script context="module">
  import Spinner from './Spinner.svelte';

  export const meta = {
    title: 'Stories/Spinner',
    component: Spinner,
    parameters: {},
    argTypes: {
      class: {
        className: 'string',
        table: { disable: true }
      },
      type: {
        control: {
          type: 'select'
        },
        options: ['border', 'grow']
      },
      size: {
        control: {
          type: 'select'
        },
        options: ['', 'sm']
      },
      color: {
        control: {
          type: 'select'
        },
        options: ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark']
      }
    },
    args: {
      type: 'border',
      size: '',
      color: 'primary'
    }
  };
</script>

<script>
  import { Story, Template } from '@storybook/addon-svelte-csf';
  const colors = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'];
</script>

<Template let:args>
  {#each colors as color}
    <Spinner {...args} {color} />
  {/each}
</Template>

<Story name="Basic" />

<Story name="Types">
  {#each colors as color}
    <Spinner type="border" {color} />
  {/each}
  <br />
  {#each colors as color}
    <Spinner type="grow" {color} />
  {/each}
</Story>

<Story name="Sizes">
  {#each colors as color}
    <Spinner size="sm" {color} />
  {/each}
  <br />
  {#each colors as color}
    <Spinner size="sm" type="grow" {color} />
  {/each}
</Story>

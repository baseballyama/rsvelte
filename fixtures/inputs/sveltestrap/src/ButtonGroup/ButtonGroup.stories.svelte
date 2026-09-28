<script context="module">
  import ButtonGroup from './ButtonGroup.svelte';

  export const meta = {
    title: 'Stories/ButtonGroup',
    component: ButtonGroup,
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
      color: {
        control: {
          type: 'select'
        },
        options: ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'link']
      },
      outline: {
        control: 'boolean'
      },
      size: {
        control: {
          type: 'select'
        },
        options: ['sm', 'md', 'lg']
      },
      vertical: {
        control: 'boolean'
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
      color: 'primary',
      outline: false,
      size: '',
      vertical: false
    }
  };
</script>

<script>
  import { Story } from '@storybook/addon-svelte-csf';
  import { Button } from '@sveltestrap/sveltestrap';

  const sizeMap = ['sm', 'md', 'lg'];

  const sizeToColorMap = {
    sm: 'primary',
    md: 'warning',
    lg: 'danger'
  };

  const basicSource = `
<ButtonGroup>
  <Button color="primary">Left</Button>
  <Button color="primary">Right</Button>
</ButtonGroup>
`;
</script>

<Story name="Basic" let:args={argss} source={basicSource}>
  <ButtonGroup {...argss}>
    <Button color={argss.color} outline={argss.outline}>Left</Button>
    <Button color={argss.color} outline={argss.outline}>Right</Button>
  </ButtonGroup>
</Story>

<Story name="Styles">
  <ButtonGroup>
    <Button color="danger">Left</Button>
    <Button color="warning">Middle</Button>
    <Button color="success">Right</Button>
  </ButtonGroup>
</Story>

<Story name="Outlines">
  <ButtonGroup>
    <Button color="primary" outline>Left</Button>
    <Button color="primary" outline>Middle</Button>
    <Button color="primary" outline>Right</Button>
  </ButtonGroup>
</Story>

<Story name="Sizes">
  <div class="horizontal">
    {#each sizeMap as size}
      <ButtonGroup {size}>
        <Button color={sizeToColorMap[size]}>Left</Button>
        <Button color={sizeToColorMap[size]}>Middle</Button>
        <Button color={sizeToColorMap[size]}>Right</Button>
      </ButtonGroup>
    {/each}
  </div>
</Story>

<Story name="Vertical">
  <ButtonGroup vertical>
    <Button color="primary">Top</Button>
    <Button color="primary">Middle</Button>
    <Button color="primary">Bottom</Button>
  </ButtonGroup>
</Story>

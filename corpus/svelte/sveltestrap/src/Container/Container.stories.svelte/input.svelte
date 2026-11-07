<script context="module">
  import Container from './Container.svelte';

  export const meta = {
    title: 'Stories/Container',
    component: Container,
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
      sm: {
        control: 'boolean'
      },
      md: {
        control: 'boolean'
      },
      lg: {
        control: 'boolean'
      },
      xl: {
        control: 'boolean'
      },
      xxl: {
        control: 'boolean'
      },
      fluid: {
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
      sm: true,
      md: true,
      lg: true,
      xl: true,
      xxl: true,
      fluid: true
    }
  };
</script>

<script>
  import { Story, Template } from '@storybook/addon-svelte-csf';
</script>

<Template let:args>
  <Container {...args}>
    <h3 class="container">fluid</h3>
  </Container>
</Template>

<Story name="Basic">
  <div class="grid-example">
    <div class="container-wrapper">
      <Container fluid>
        <h3 class="container">fluid</h3>
      </Container>
      <div class="contained">
        <Container sm>
          <h3 class="container">sm</h3>
        </Container>

        <Container md>
          <h3 class="container">md</h3>
        </Container>

        <Container lg>
          <h3 class="container">lg</h3>
        </Container>

        <Container xl>
          <h3 class="container">xl</h3>
        </Container>

        <Container xxl>
          <h3 class="container">xxl</h3>
        </Container>
      </div>
    </div>
  </div>
</Story>

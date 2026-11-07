<script context="module">
  import Alert from './Alert.svelte';

  export const meta = {
    title: 'Stories/Alert',
    component: Alert,
    parameters: {
      controls: {
        exclude: /^(default)$/g
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
      closeClassName: {
        control: false,
        table: {
          disable: true
        }
      },
      closeAriaLabel: {
        control: false,
        table: {
          disable: true
        }
      },
      color: {
        control: {
          type: 'select'
        },
        options: ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark']
      },
      dismissible: {
        control: 'boolean'
      },
      fade: {
        control: 'boolean'
      },
      heading: {
        control: ''
      },
      isOpen: {
        control: 'boolean'
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
      toggle: {
        control: false,
        table: {
          disable: true
        }
      },
      transition: {
        control: false,
        table: {
          disable: true
        }
      },
      'heading ': {
        description: 'This is the slot to use for custom headings.',
        table: {
          category: 'slots',
          type: {
            summary: 'any'
          },
          defaultValue: {
            summary: 'empty'
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
      class: '',
      content: undefined,
      color: 'success',
      closeClassName: '',
      closeAriaLabel: 'Close',
      dismissible: false,
      fade: true,
      heading: '',
      isOpen: true,
      theme: null
    }
  };
</script>

<script>
  import { Story, Template } from '@storybook/addon-svelte-csf';
  import { Button } from '@sveltestrap/sveltestrap';

  const colors = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'];

  let isOpen = true;
  let toggle = () => (isOpen = !isOpen);
</script>

<Template let:args>
  <Alert {...args} on:click></Alert>
</Template>

<Story name="Basic" args={{ content: "Hello, I'm a warning message.", color: 'warning' }} />

<Story name="Colors">
  {#each colors as color}
    <Alert {color}>
      <h4 class="alert-heading text-capitalize">Heading</h4>
      This is the contents of a&nbsp;<b><u>{color}</u></b> alert message.&nbsp;

      <a href="#todo" class="alert-link">Also, links are colored to match the assigned alert color! </a>
    </Alert>
  {/each}
</Story>

<Story name="Fade">
  <Alert color="primary" {isOpen} toggle={() => (isOpen = false)} fade={false}>
    I am a primary alert and I can be dismissed without animating!
  </Alert>
</Story>

<Story name="Header">
  <Alert color="primary" heading="Hey here's header text">Lorem ipsum lorem dolor sit amet.</Alert>
</Story>

<Story name="Dismissible">
  <Alert color="info" dismissible>I am an alert and I can be dismissed!</Alert>
</Story>

<Story name="Controlled">
  <Alert color="primary" {isOpen} toggle={() => (isOpen = false)}>
    I can be controlled via <code>isOpen</code> and <code>toggle</code>.
  </Alert>

  <Button color="danger" on:click={toggle}>You can toggle me here.</Button>
</Story>

<Story name="Theming">
  <Alert theme="dark" color="primary" isOpen={true}>
    <h4 class="alert-heading">Dark Theme</h4>
    I am a&nbsp;<code>dark</code> themed primary alert!
  </Alert>

  <Alert theme="light" heading="Light Theme" color="primary" isOpen={true}>
    I am a&nbsp;<code>light</code> themed primary alert!
  </Alert>
</Story>

<script context="module">
  import Card from './Card.svelte';

  export const meta = {
    title: 'Stories/Card',
    component: Card,
    parameters: {
      controls: {
        exclude: /^(click|default)$/g
      }
    },
    argTypes: {
      class: {
        className: 'string',
        table: { disable: true }
      },
      body: {
        control: 'boolean'
      },
      color: {
        control: {
          type: 'select'
        },
        options: ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark']
      },
      inverse: {
        control: 'boolean'
      },
      outline: {
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
      body: false,
      color: undefined,
      inverse: false,
      outline: false,
      theme: null
    }
  };
</script>

<script>
  import { Story, Template } from '@storybook/addon-svelte-csf';
  import {
    Button,
    CardBody,
    CardFooter,
    CardHeader,
    CardSubtitle,
    CardText,
    CardTitle
  } from '@sveltestrap/sveltestrap';
</script>

<Template let:args>
  <div class="card-example">
    <div class="card-width">
      <Card {...args}>
        <CardBody>Hello World</CardBody>
      </Card>
    </div>
  </div>
</Template>

<Story name="Basic" />

<Story name="Body">
  <div class="card-example">
    <div class="card-width">
      <Card body>Goodbye Cruel World</Card>
    </div>
  </div>
</Story>

<Story name="HeaderFooter">
  <div class="card-example">
    <div class="card-width">
      <Card class="mb-3">
        <CardHeader>
          <CardTitle>Card title</CardTitle>
        </CardHeader>
        <CardBody>
          <CardSubtitle>Card subtitle</CardSubtitle>
          <CardText>
            Some quick example text to build on the card title and make up the bulk of the card's content.
          </CardText>
          <Button>Button</Button>
        </CardBody>
        <CardFooter>Footer</CardFooter>
      </Card>
    </div>
  </div>
</Story>

<Story name="ColorInverse">
  <div class="card-example">
    <div class="card-width">
      <Card body color="primary" inverse class="mb-3">Primary</Card>

      <Card body color="secondary" class="mb-3">Secondary</Card>

      <Card body color="success" class="mb-3">Success</Card>

      <Card body color="danger" class="mb-3">Danger</Card>

      <Card body color="warning" class="mb-3">Warning</Card>

      <Card body color="info" class="mb-3">Info</Card>

      <Card body color="dark" inverse class="mb-3">Dark</Card>

      <Card body color="light" class="mb-3">Light</Card>
    </div>
  </div>
</Story>

<Story name="Theming">
  <div class="card-example vertical gap-lg">
    <div class="card-width">
      <Card theme="dark" class="mb-3">
        <CardHeader>
          <CardTitle>Dark Theme</CardTitle>
        </CardHeader>
        <CardBody>
          <CardSubtitle>Card subtitle</CardSubtitle>
          <CardText>
            Some quick example text to build on the card title and make up the bulk of the card's content.
          </CardText>
          <Button>Button</Button>
        </CardBody>
        <CardFooter>Footer</CardFooter>
      </Card>
    </div>
    <div class="card-width">
      <Card theme="light">
        <CardHeader>
          <CardTitle>Light Theme</CardTitle>
        </CardHeader>
        <CardBody>
          <CardSubtitle>Card subtitle</CardSubtitle>
          <CardText>
            Some quick example text to build on the card title and make up the bulk of the card's content.
          </CardText>
          <Button>Button</Button>
        </CardBody>
        <CardFooter>Footer</CardFooter>
      </Card>
    </div>
  </div>
</Story>

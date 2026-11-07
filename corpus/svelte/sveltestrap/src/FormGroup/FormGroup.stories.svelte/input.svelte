<script context="module">
  import FormGroup from './FormGroup.svelte';

  export const meta = {
    title: 'Stories/FormGroup',
    component: FormGroup,
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
      className: {
        control: 'text',
        table: { disable: true }
      },
      check: {
        control: 'boolean',
        table: { disable: true }
      },
      disabled: {
        control: 'boolean'
      },
      floating: {
        control: 'boolean'
      },
      inline: {
        control: 'boolean'
      },
      label: {
        control: 'text'
      },
      row: {
        control: 'boolean'
      },
      spacing: {
        control: 'text'
      },
      tag: {
        control: {
          type: 'select'
        },
        options: ['div', 'fieldset'],
        table: { disable: true }
      },
      'label ': {
        description: 'This slot is used for provided a custom label.',
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
      check: false,
      disabled: false,
      floating: false,
      inline: false,
      spacing: 'mb-3',
      label: '',
      row: false
    }
  };
</script>

<script>
  import { Story, Template } from '@storybook/addon-svelte-csf';
  import { Badge, Form, Input } from '@sveltestrap/sveltestrap';
</script>

<Template let:args>
  <div class="form-width form-groups-example">
    <Form {...args}>
      <FormGroup {...args}>
        <Input {...args} placeholder="Enter a value" />
      </FormGroup>
    </Form>
  </div>
</Template>

<Story name="Basic" />

<Story name="Floating">
  <Form>
    <div class="form-width">
      <FormGroup floating label="Floating Label">
        <Input placeholder="Enter a value" />
      </FormGroup>

      <FormGroup floating label="Select labels always float">
        <Input type="select" placeholder="Enter a value">
          <option />
          <option value="alpha">Alpha</option>
          <option value="bravo">Bravo</option>
          <option value="charlie">Charlie</option>
        </Input>
      </FormGroup>

      <FormGroup floating>
        <Input placeholder="Enter a value" />
        <div slot="label">
          Floating Label Slot <Badge>3</Badge>
        </div>
      </FormGroup>
    </div>
  </Form>
</Story>

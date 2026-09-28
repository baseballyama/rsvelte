<script context="module">
  import Pagination from './Pagination.svelte';

  export const meta = {
    title: 'Stories/Pagination',
    component: Pagination,
    parameters: {
      controls: {
        exclude: /^(default)$/g
      }
    },
    argTypes: {
      ariaLabel: {
        control: 'text'
      },
      class: {
        className: 'string',
        table: { disable: true }
      },
      listClassName: {
        control: 'text'
      },
      size: {
        control: {
          type: 'select'
        },
        options: ['', 'sm', 'lg']
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
      ariaLabel: 'Page navigation example',
      listClassName: '',
      size: '',
      theme: null
    }
  };
</script>

<script>
  import { Story, Template } from '@storybook/addon-svelte-csf';
  import { PaginationItem, PaginationLink } from '@sveltestrap/sveltestrap';
</script>

<Template let:args>
  <Pagination {...args}>
    <PaginationItem disabled>
      <PaginationLink first href="#" />
    </PaginationItem>
    <PaginationItem disabled>
      <PaginationLink previous href="#" />
    </PaginationItem>
    <PaginationItem active>
      <PaginationLink href="#">1</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">2</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">3</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">4</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">5</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink next href="#" />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink last href="#" />
    </PaginationItem>
  </Pagination>
</Template>

<Story name="Basic" />

<Story name="Sizes">
  <Pagination size="lg" ariaLabel="Page navigation example">
    <PaginationItem>
      <PaginationLink first href="#" />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink previous href="#" />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">1</PaginationLink>
    </PaginationItem>
    <PaginationItem active>
      <PaginationLink href="#">2</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">3</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink next href="#" />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink last href="#" />
    </PaginationItem>
  </Pagination>
</Story>

<Story name="Theming">
  <div class="vertical gap-xl">
    <Pagination theme="dark" ariaLabel="Dark page navigation example">
      <PaginationItem>
        <PaginationLink first href="#" />
      </PaginationItem>
      <PaginationItem>
        <PaginationLink previous href="#" />
      </PaginationItem>
      <PaginationItem>
        <PaginationLink href="#">1</PaginationLink>
      </PaginationItem>
      <PaginationItem active>
        <PaginationLink href="#">2</PaginationLink>
      </PaginationItem>
      <PaginationItem>
        <PaginationLink href="#">3</PaginationLink>
      </PaginationItem>
      <PaginationItem>
        <PaginationLink next href="#" />
      </PaginationItem>
      <PaginationItem>
        <PaginationLink last href="#" />
      </PaginationItem>
    </Pagination>

    <Pagination theme="light" ariaLabel="Light page navigation example">
      <PaginationItem>
        <PaginationLink first href="#" />
      </PaginationItem>
      <PaginationItem>
        <PaginationLink previous href="#" />
      </PaginationItem>
      <PaginationItem>
        <PaginationLink href="#">1</PaginationLink>
      </PaginationItem>
      <PaginationItem active>
        <PaginationLink href="#">2</PaginationLink>
      </PaginationItem>
      <PaginationItem>
        <PaginationLink href="#">3</PaginationLink>
      </PaginationItem>
      <PaginationItem>
        <PaginationLink next href="#" />
      </PaginationItem>
      <PaginationItem>
        <PaginationLink last href="#" />
      </PaginationItem>
    </Pagination>
  </div>
</Story>

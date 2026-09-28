<script context="module">
  import Offcanvas from './Offcanvas.svelte';

  export const meta = {
    title: 'Stories/Offcanvas',
    component: Offcanvas,
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
      backdrop: {
        control: 'boolean'
      },
      body: {
        control: 'boolean'
      },
      fade: {
        control: 'boolean'
      },
      header: {
        control: ''
      },
      isOpen: {
        control: false,
        table: {
          disable: true
        }
      },
      keyboard: {
        control: 'boolean'
      },
      placement: {
        control: {
          type: 'select'
        },
        options: ['start', 'end', 'top', 'bottom']
      },
      scroll: {
        control: 'boolean'
      },
      style: {
        control: ''
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
      'header ': {
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
</script>

<script>
  import { Story, Template } from '@storybook/addon-svelte-csf';
  import { Button } from '@sveltestrap/sveltestrap';

  let isOpen = false;
  let status = 'Closed';
  let endOpen = false;
  let bottomOpen = false;
  let topOpen = false;
  const toggleEnd = () => (endOpen = !endOpen);
  const toggleBottom = () => (bottomOpen = !bottomOpen);
  const toggleTop = () => (topOpen = !topOpen);

  const toggle = () => {
    isOpen = !isOpen;
  };

  const basicSource = `<Button color="primary" on:click={toggle}>Open Start</Button>

<Offcanvas {isOpen} {toggle} header="Start">
  Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
  tempor incididunt ut labore et dolore magna aliqua.
</Offcanvas>`;
</script>

<Story name="Basic" let:args source={basicSource}>
  <Button color="primary capitalize" on:click={toggle}>Open {args.placement}</Button>

  <Offcanvas {...args} {isOpen} {toggle}>
    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
    aliqua.
  </Offcanvas>
</Story>

<Story name="Backdrop">
  <Button color="primary" on:click={toggle}>Open</Button>

  <Offcanvas header="No Backdrop" backdrop={false} {isOpen} {toggle}>Look ma, no backdrop.</Offcanvas>
</Story>

<Story name="Events">
  <Button color="primary" on:click={toggle}>Open</Button>
  <code>&nbsp; Current state: {status}</code>

  <Offcanvas
    {isOpen}
    {toggle}
    placement="end"
    on:opening={() => (status = 'Opening...')}
    on:open={() => (status = 'Opened')}
    on:closing={() => (status = 'Closing...')}
    on:close={() => (status = 'Closed')}
  >
    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
    aliqua.
  </Offcanvas>
</Story>

<Story name="Placement">
  <Button color="danger" on:click={toggle}>Start</Button>
  <Button color="warning" on:click={() => (endOpen = !endOpen)}>End</Button>
  <Button color="success" on:click={() => (topOpen = !topOpen)}>Top</Button>
  <Button color="info" on:click={() => (bottomOpen = !bottomOpen)}>Bottom</Button>

  <Offcanvas {isOpen} {toggle} header="Start" placement="start">
    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
    aliqua.
  </Offcanvas>

  <Offcanvas isOpen={endOpen} toggle={toggleEnd} placement="end" header="Right">
    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
    aliqua.
  </Offcanvas>

  <Offcanvas isOpen={topOpen} toggle={toggleTop} placement="top" header="Top">
    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
    aliqua.
  </Offcanvas>

  <Offcanvas isOpen={bottomOpen} toggle={toggleBottom} placement="bottom" header="Bottom">
    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
    aliqua.
  </Offcanvas>
</Story>

<Story name="Slots">
  <Button color="primary" on:click={toggle}>Open</Button>

  <Offcanvas scroll {isOpen} {toggle}>
    <h1 slot="header">
      <i>Hello <b>World!</b></i>
    </h1>
    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
    aliqua.
  </Offcanvas>
</Story>

<Story name="Manual">
  <Button color="primary" on:click={() => (isOpen = true)}>Open</Button>

  <Offcanvas header="No toggle or esc" scroll {isOpen}>
    <Button color="danger" on:click={() => (isOpen = false)}>Close Me</Button>
  </Offcanvas>
</Story>

<Story name="Scrolling">
  <Button color="primary" on:click={toggle}>Open</Button>

  <Offcanvas header="You can scroll the body" scroll {isOpen} {toggle} backdrop={false}>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua.
    </p>

    <p>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua.
    </p>

    <p>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua.
    </p>

    <p>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua.
    </p>

    <p>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua.
    </p>

    <p>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua.
    </p>

    <p>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua.
    </p>

    <p>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua.
    </p>

    <p>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua.
    </p>

    <p>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua.
    </p>

    <p>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua.
    </p>

    <p>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua.
    </p>

    <p>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua.
    </p>

    <p>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua.
    </p>
  </Offcanvas>
</Story>

<Story name="Custom">
  <Button color="primary" on:click={() => (isOpen = true)}>Open</Button>

  <Offcanvas {isOpen} body={false} style="width: 150px" class="bg-danger">
    <div on:click={() => (isOpen = false)}>
      <img src="https://picsum.photos/150/1200" alt="Meaningless content" />
    </div>
  </Offcanvas>
</Story>

<Story name="Theming">
  <Button color="dark" on:click={toggle}>Dark Theme</Button>
  <Button color="light" on:click={() => (endOpen = !endOpen)}>Light Theme</Button>

  <Offcanvas theme="dark" {isOpen} {toggle} header="Dark Theme" placement="start">
    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
    aliqua.
  </Offcanvas>

  <Offcanvas theme="light" isOpen={endOpen} toggle={toggleEnd} header="Light Theme" placement="end">
    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
    aliqua.
  </Offcanvas>
</Story>

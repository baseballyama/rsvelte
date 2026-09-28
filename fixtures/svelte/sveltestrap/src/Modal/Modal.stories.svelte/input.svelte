<script context="module">
  import Modal from './Modal.svelte';

  export const meta = {
    title: 'Stories/Modal',
    component: Modal,
    parameters: {
      controls: {
        exclude: /^(close|closing|default|external|open|opening)$/g
      }
    },
    argTypes: {
      class: {
        className: 'string',
        table: { disable: true }
      },
      static: {
        staticModal: 'string',
        table: { disable: true }
      },
      isOpen: {
        control: 'boolean'
      },
      autoFocus: {
        control: 'boolean'
      },
      body: {
        control: 'boolean'
      },
      centered: {
        control: 'boolean'
      },
      container: {
        control: 'text',
        table: { disable: true }
      },
      fullscreen: {
        control: 'boolean'
      },
      header: {
        control: 'text'
      },
      keyboard: {
        control: 'boolean'
      },
      scrollable: {
        control: 'boolean'
      },
      size: {
        control: {
          type: 'select'
        },
        options: ['sm', 'md', 'lg', 'xl']
      },
      toggle: {
        control: 'text',
        table: { disable: true }
      },
      labelledBy: {
        control: 'text',
        table: { disable: true }
      },
      backdrop: {
        control: 'boolean'
      },
      wrapClassName: {
        control: 'text',
        table: { disable: true }
      },
      modalClassName: {
        control: 'text',
        table: { disable: true }
      },
      contentClassName: {
        control: 'text',
        table: { disable: true }
      },
      fade: {
        control: 'boolean'
      },
      unmountOnClose: {
        control: 'boolean',
        table: { disable: true }
      },
      returnFocusAfterClose: {
        control: 'boolean',
        table: { disable: true }
      },
      modalStyle: {
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
      'on:open': {
        control: false,
        description: 'This event is fired once the Modal has opened.',
        table: {
          category: 'events',
          type: {
            summary: 'Function'
          },
          defaultValue: {
            summary: 'null'
          }
        }
      },
      'on:opening': {
        control: false,
        description: 'This event is fired immediately once open has been triggered.',
        table: {
          category: 'events',
          type: {
            summary: 'Function'
          },
          defaultValue: {
            summary: 'null'
          }
        }
      },
      'on:close': {
        description: 'This event is fired once the Modal has closed.',
        table: {
          category: 'events',
          type: {
            summary: 'Function'
          },
          defaultValue: {
            summary: 'null'
          }
        }
      },
      'on:closing': {
        description: 'This event is fired immediately once close has been triggered.',
        table: {
          category: 'events',
          type: {
            summary: 'Function'
          },
          defaultValue: {
            summary: 'null'
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
      },
      'external ': {
        description: 'This is for any content to include outside of the modal.',
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
      autoFocus: true,
      backdrop: true,
      body: false,
      centered: false,
      container: undefined,
      fade: true,
      fullscreen: false,
      header: undefined,
      isOpen: false,
      keyboard: true,
      returnFocusAfterClose: true,
      scrollable: false,
      size: 'md',
      theme: null,
      toggle: undefined,
      unmountOnClose: true
    }
  };
</script>

<script>
  import { Story, Template } from '@storybook/addon-svelte-csf';
  import { Button, ButtonGroup, Icon, ModalBody, ModalFooter, ModalHeader } from '@sveltestrap/sveltestrap';

  let open = false;
  let openScrollable = false;
  let status = 'Closed';
  let fullscreen;
  let size;

  const toggle = () => {
    size = undefined;
    open = !open;
  };

  const toggleLg = () => {
    size = 'lg';
    open = !open;
  };

  const toggleSm = () => {
    size = 'sm';
    open = !open;
  };

  const toggleXl = () => {
    size = 'xl';
    open = !open;
  };

  const toggleAlways = () => {
    fullscreen = true;
    open = !open;
  };

  const toggleScrollable = () => (openScrollable = !openScrollable);
</script>

<Template let:args>
  <div>
    <Button color="danger" on:click={toggle}>Open Modal</Button>
    <Modal {...args} isOpen={open} {toggle} modalStyle="--bs-modal-color: {args.theme === 'dark' ? '#fff' : '#111'}">
      <ModalHeader {toggle}>Modal title</ModalHeader>
      <ModalBody>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
        magna aliqua.
      </ModalBody>
      <ModalFooter>
        <Button color="primary" on:click={toggle}>Do Something</Button>
        <Button color="secondary" on:click={toggle}>Cancel</Button>
      </ModalFooter>
    </Modal>
  </div>
</Template>

<Story name="Basic" />

<Story name="Shorthand">
  <div>
    <Button color="danger" on:click={toggle}>Open Modal</Button>
    <Modal body header="Modal title" isOpen={open} {toggle}>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua.
    </Modal>
  </div>
</Story>

<Story name="Sizes">
  <div>
    <div>
      <ButtonGroup>
        <Button color="success" on:click={toggleSm}>Open Small Modal</Button>
        <Button color="warning" on:click={toggle}>Open Default Modal</Button>
        <Button color="danger" on:click={toggleLg}>Open Large Modal</Button>
        <Button color="light" on:click={toggleXl}>Open Extra Large Modal</Button>
      </ButtonGroup>

      <Modal isOpen={open} {toggle} {size}>
        <ModalHeader {toggle}>Modal title</ModalHeader>
        <ModalBody>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua.
        </ModalBody>
        <ModalFooter>
          <Button color="primary" on:click={toggle}>Do Something</Button>
          <Button color="secondary" on:click={toggle}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </div>
  </div>
</Story>

<Story name="Fullscreen">
  <div>
    <Button color="primary" on:click={toggleAlways}>Open Fullscreen Modal</Button>

    <Modal isOpen={open} {toggle} {fullscreen}>
      <ModalHeader {toggle}>Modal title</ModalHeader>
      <ModalBody>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
        magna aliqua.
      </ModalBody>
      <ModalFooter>
        <Button color="primary" on:click={toggle}>Do Something</Button>
        <Button color="secondary" on:click={toggle}>Cancel</Button>
      </ModalFooter>
    </Modal>
  </div>
</Story>

<Story name="Scrolling">
  <div>
    <Button color="primary" on:click={toggle}>Default scrolling</Button>
    <Button color="success" on:click={toggleScrollable}>Scrollable modal body</Button>
    <Modal isOpen={open} {toggle}>
      <ModalHeader {toggle}>Modal title</ModalHeader>
      <ModalBody>
        <p style="min-height: 1000px;">
          This is some placeholder content to show the scrolling behavior for modals. Instead of repeating the text the
          modal, we use an inline style set a minimum height, thereby extending the length of the overall modal and
          demonstrating the overflow scrolling. When content becomes longer than the height of the viewport, scrolling
          will move the modal as needed.
        </p>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" on:click={toggle}>Do Something</Button>
        <Button color="secondary" on:click={toggle}>Cancel</Button>
      </ModalFooter>
    </Modal>

    <Modal isOpen={openScrollable} toggle={toggleScrollable} scrollable>
      <ModalHeader toggle={toggleScrollable}>Modal title</ModalHeader>
      <ModalBody>
        <p style="min-height: 1000px;">
          This is some placeholder content to show the scrolling behavior for modals. Instead of repeating the text the
          modal, we use an inline style set a minimum height, thereby extending the length of the overall modal and
          demonstrating the overflow scrolling. When content becomes longer than the height of the viewport, scrolling
          will move the modal as needed.
        </p>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" on:click={toggleScrollable}>Do Something</Button>
        <Button color="secondary" on:click={toggleScrollable}>Cancel</Button>
      </ModalFooter>
    </Modal>
  </div>
</Story>

<Story name="Backdrop">
  <div>
    <Button color="danger" on:click={toggle}>Modal with no Backdrop</Button>
    <Modal isOpen={open} backdrop={false} {toggle}>
      <ModalHeader {toggle}>Modal title</ModalHeader>
      <ModalBody>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
        magna aliqua.
      </ModalBody>
      <ModalFooter>
        <Button color="primary" on:click={toggle}>Do Something</Button>
        <Button color="secondary" on:click={toggle}>Cancel</Button>
      </ModalFooter>
    </Modal>
  </div>
</Story>

<Story name="StaticBackdrop">
  <div>
    <Button color="danger" on:click={toggle}>Modal with Static Backdrop</Button>
    <Modal isOpen={open} backdrop="static" {toggle}>
      <ModalHeader {toggle}>Modal title</ModalHeader>
      <ModalBody>Clicking outside modal or hitting Escape does not dismiss.</ModalBody>
      <ModalFooter>
        <Button color="primary" on:click={toggle}>Do Something</Button>
        <Button color="secondary" on:click={toggle}>Cancel</Button>
      </ModalFooter>
    </Modal>
  </div>
</Story>

<Story name="Fade">
  <div>
    <Button color="danger" on:click={toggle}>Modal with no Fade</Button>
    <Modal isOpen={open} fade={false} {toggle}>
      <ModalHeader {toggle}>Modal title</ModalHeader>
      <ModalBody>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
        magna aliqua.
      </ModalBody>
      <ModalFooter>
        <Button color="primary" on:click={toggle}>Do Something</Button>
        <Button color="secondary" on:click={toggle}>Cancel</Button>
      </ModalFooter>
    </Modal>
  </div>
</Story>

<Story name="Events">
  <div class="modal-example">
    <h5 class="text-content">Current state: {status}</h5>
    <Button color="danger" on:click={toggle}>Open Modal</Button>
    <Modal
      body
      header="Modal title"
      isOpen={open}
      {toggle}
      on:opening={() => (status = 'Opening...')}
      on:open={() => (status = 'Opened')}
      on:closing={() => (status = 'Closing...')}
      on:close={() => (status = 'Closed')}
    >
      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua.
    </Modal>
  </div>
</Story>

<Story name="Static">
  <div>
    <Modal static isOpen>
      <ModalHeader>Static Modal</ModalHeader>
      <ModalBody>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
        magna aliqua.
      </ModalBody>
    </Modal>
  </div>
</Story>

<Story name="ExternalContent">
  <div>
    <Button color="danger" on:click={toggle}>Open Modal</Button>
    <Modal isOpen={open} {toggle} body>
      <div slot="external" class="text-end">
        <Button color="link" class="text-white" size="lg" on:click={toggle}>
          <Icon name="x" class="h1" />
        </Button>
      </div>
      <h4>You can add content outside the Modal.</h4>
      <p>Click the X on right to close.</p>
    </Modal>
  </div>
</Story>

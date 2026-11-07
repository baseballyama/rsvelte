<script context="module">
  import Toast from './Toast.svelte';

  export const meta = {
    title: 'Stories/Toast',
    component: Toast,
    parameters: {
      controls: {
        exclude: /^(close|closing|default|open|opening)$/g
      }
    },
    argTypes: {
      color: {
        control: {
          type: 'select'
        },
        options: ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'],
        description: 'Color of the Toast background.',
        table: {
          type: {
            summary: 'string'
          },
          defaultValue: {
            summary: 'primary'
          }
        }
      },
      class: {
        className: 'string',
        table: { disable: true }
      },
      autohide: {
        control: 'boolean'
      },
      body: {
        control: 'boolean'
      },
      delay: {
        control: 'number'
      },
      duration: {
        control: 'number'
      },
      fade: {
        control: 'boolean'
      },
      header: {
        control: 'text',
        table: { disable: true }
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
        control: 'null',
        table: {
          disable: true
        }
      },
      'on:open': {
        control: false,
        description: 'This event is fired once the Toast has opened.',
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
        description: 'This event is fired once the Toast has closed.',
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
      }
    },
    args: {
      color: 'primary',
      autohide: false,
      body: false,
      delay: 5000,
      duration: 200,
      fade: true,
      isOpen: true
    }
  };
</script>

<script>
  import { Story, Template } from '@storybook/addon-svelte-csf';
  import { Button, Icon, ToastBody, ToastHeader } from '@sveltestrap/sveltestrap';

  const colors = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'];

  let isOpen = false;
  let status = 'Closed';

  function toggle() {
    isOpen = !isOpen;
  }

  function reopen() {
    isOpen = true;
  }

  let seconds = 5;
  let countdownInterval = null;

  function startCountdown() {
    countdownInterval = setInterval(() => {
      if (seconds <= 0) {
        clearInterval(countdownInterval);
      } else {
        seconds--;
      }
    }, 1000);
  }

  function startCount() {
    isOpen = true;
    seconds = 5;
    clearInterval(countdownInterval);
    countdownInterval = null;
    startCountdown();
  }

  const basicStorySource = `
<div class="p-3 bg-primary mb-3 rounded">
  <Toast>
    <ToastHeader>Sveltestrap</ToastHeader>
    <ToastBody>
      This is a toast on a primary background — check it out!
    </ToastBody>
  </Toast>
</div>`;
</script>

<Template let:args>
  <div class="toast-width">
    <div class="p-3 bg-{args.color} mb-3 rounded">
      <Toast
        {...args}
        theme={args.theme || null}
        style="--bs-toast-color: {args.theme === 'dark' ? '#fff' : '#111'};"
        class="me-1"
      >
        <ToastHeader>Sveltestrap</ToastHeader>
        <ToastBody>
          This is a toast on a {args.color} background — check it out!
        </ToastBody>
      </Toast>
    </div>
  </div>
</Template>

<Story name="Basic" source={basicStorySource} />

<Story name="Icons">
  <div class="columns">
    {#each colors as color}
      <div class="column">
        <div class="p-2 mb-3">
          <Toast class="me-1">
            <ToastHeader icon={color}>{color}</ToastHeader>
            <ToastBody>
              This is a toast with a {color} icon.
            </ToastBody>
          </Toast>
        </div>
      </div>
    {/each}

    <div class="column">
      <div class="p-2 mb-3">
        <Toast class="me-1">
          <ToastHeader>
            <Icon slot="icon" name="emoji-sunglasses" class="me-2" />
            Sveltestrap
          </ToastHeader>
          <ToastBody>This is a toast with a custom icon.</ToastBody>
        </Toast>
      </div>
    </div>
  </div>
</Story>

<Story name="Dismissible">
  <Toast {isOpen}>
    <ToastHeader {toggle}>Toast title</ToastHeader>
    <ToastBody>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
      consequat.
    </ToastBody>
  </Toast>

  {#if !isOpen}
    <Button color="primary" on:click={reopen}>Show Toast</Button>
  {/if}
</Story>

<Story name="Autohide">
  <Button color="primary" on:click={startCount} disabled={isOpen}>Show Toast that autohides</Button>
  <Toast autohide body header="Autohides in {seconds} sec" {isOpen} on:close={() => (isOpen = false)}>
    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
    aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
  </Toast>
</Story>

<Story name="Events">
  <div class="toast-events">
    <h5>Current state: {status}</h5>

    <Button color="danger" on:click={toggle}>{isOpen ? 'Close' : 'Open'} Toast</Button>

    <Toast
      body
      theme="dark"
      header="It's Toasterific"
      --bs-toast-color="#fff"
      {isOpen}
      on:open={() => (status = 'Opened')}
      on:opening={() => (status = 'Opening...')}
      on:closing={() => (status = 'Closing...')}
      on:close={() => (status = 'Closed')}
    >
      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
      consequat.
    </Toast>
  </div>
</Story>

<Story name="Theming">
  <div class="horizontal gap-lg toast-events">
    <Toast body theme="dark" header="Dark Theme" style="--bs-toast-color: #fff;" isOpen={true}>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
      consequat.
    </Toast>

    <Toast theme="light" style="--bs-toast-color: #000;">
      <ToastHeader>Light Theme</ToastHeader>
      <ToastBody>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
        magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
        consequat.
      </ToastBody>
    </Toast>
  </div>
</Story>

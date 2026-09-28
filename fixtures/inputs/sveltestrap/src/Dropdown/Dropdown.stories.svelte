<script context="module">
  import Dropdown from './Dropdown.svelte';

  export const meta = {
    title: 'Stories/Dropdown',
    component: Dropdown,
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
      active: {
        control: 'boolean'
      },
      autoClose: {
        control: 'boolean'
      },
      direction: {
        control: {
          type: 'select'
        },
        options: ['down', 'up', 'left', 'right', 'start', 'end'],
        table: { disable: true }
      },
      dropup: {
        control: 'boolean'
      },
      group: {
        control: 'boolean'
      },
      inNavbar: {
        control: 'boolean',
        table: { disable: true }
      },
      isOpen: {
        control: 'boolean'
      },
      nav: {
        control: 'boolean',
        table: { disable: true }
      },
      setActiveFromChild: {
        control: 'boolean',
        table: { disable: true }
      },
      size: {
        control: {
          type: 'select'
        },
        options: ['sm', '', 'lg']
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
        control: 'boolean',
        table: { disable: true }
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
      active: false,
      autoClose: true,
      direction: 'down',
      dropup: false,
      group: true,
      isOpen: false,
      nav: false,
      setActiveFromChild: false,
      size: '',
      theme: null,
      toggle: false
    }
  };
</script>

<script>
  import { Story, Template } from '@storybook/addon-svelte-csf';
  import {
    ButtonToolbar,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Input,
    Nav,
    NavItem,
    NavLink,
    Navbar
  } from '@sveltestrap/sveltestrap';

  let isOpen = false;

  const directions = ['down', 'up', 'left', 'right', 'start', 'end'];
  const sizes = ['sm', '', 'lg'];

  const basicSource = `<Dropdown direction="down">
  <DropdownToggle color="primary" caret>Dropdown</DropdownToggle>
  <DropdownMenu>
    <DropdownItem header>Header</DropdownItem>
    <DropdownItem>Some Action</DropdownItem>
    <DropdownItem disabled>Action (disabled)</DropdownItem>
    <DropdownItem divider />
    <DropdownItem>Foo Action</DropdownItem>
    <DropdownItem>Bar Action</DropdownItem>
    <DropdownItem>Quo Action</DropdownItem>
  </DropdownMenu>
</Dropdown>`;
</script>

<Template let:args>
  <div class="dropdown-example">
    <div class="drop-height">
      <Dropdown {...args}>
        <DropdownToggle color="primary" caret>Drop{args.direction}</DropdownToggle>
        <DropdownMenu>
          <DropdownItem header>Header</DropdownItem>
          <DropdownItem>Some Action</DropdownItem>
          <DropdownItem disabled>Action (disabled)</DropdownItem>
          <DropdownItem divider />
          <DropdownItem>Foo Action</DropdownItem>
          <DropdownItem>Bar Action</DropdownItem>
          <DropdownItem>Quo Action</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  </div>
</Template>

<Story name="Basic" source={basicSource} />

<Story name="Alignment">
  <div class="dropdown-example">
    <div class="drop-height">
      <Dropdown>
        <DropdownToggle color="primary" caret>Dropdown's menu is right-aligned</DropdownToggle>
        <DropdownMenu end>
          <DropdownItem header>Header</DropdownItem>
          <DropdownItem disabled>Action</DropdownItem>
          <DropdownItem>Another Action</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  </div>
</Story>

<Story name="Direction">
  <div class="dropdown-example">
    <div class="horizontal drop-height">
      {#each directions as direction}
        <Dropdown {direction}>
          <DropdownToggle color="primary" caret>Drop{direction}</DropdownToggle>
          <DropdownMenu>
            <DropdownItem>Another Action</DropdownItem>
            <DropdownItem>Another Action</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      {/each}
    </div>
  </div>
</Story>

<Story name="Sizes">
  <div class="dropdown-example">
    <div class="horizontal drop-height">
      {#each sizes as size}
        <Dropdown {size}>
          <DropdownToggle color="primary" caret>Dropdown {size}</DropdownToggle>
          <DropdownMenu>
            <DropdownItem>Another Action</DropdownItem>
            <DropdownItem>Another Action</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      {/each}
    </div>
  </div>
</Story>

<Story name="Container">
  <div class="dropdown-example">
    <div class="drop-height">
      <Dropdown {isOpen} toggle={() => (isOpen = !isOpen)}>
        <DropdownToggle tag="div" class="d-inline-block">
          <Input />
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem header>Header</DropdownItem>
          <DropdownItem disabled>Action</DropdownItem>
          <DropdownItem>Another Action</DropdownItem>
          <DropdownItem divider />
          <DropdownItem>Another Action</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  </div>
</Story>

<Story name="SetActiveFromChild">
  <div class="dropdown-example">
    <div class="drop-height">
      <Navbar color="dark" dark expand="md">
        <Nav navbar>
          <NavItem>
            <NavLink href="/components/">Inactive Link</NavLink>
          </NavItem>
          <Dropdown nav setActiveFromChild>
            <DropdownToggle nav class="nav-link" caret>Dropdown</DropdownToggle>
            <DropdownMenu>
              <DropdownItem href="#" active>Lancelot</DropdownItem>
              <DropdownItem href="#">Link</DropdownItem>
              <DropdownItem href="#">Secret</DropdownItem>
              <DropdownItem href="#">Chimp</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </Nav>
      </Navbar>
    </div>
  </div>
</Story>

<Story name="AutoClose">
  <div class="dropdown-example">
    <div class="drop-height">
      <ButtonToolbar>
        <div class="horizontal">
          <Dropdown autoClose={true}>
            <DropdownToggle color="primary" caret>Default dropdown</DropdownToggle>
            <DropdownMenu>
              <DropdownItem>Menu item</DropdownItem>
              <DropdownItem>Menu item</DropdownItem>
              <DropdownItem>Menu item</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <Dropdown autoClose="outside">
            <DropdownToggle color="success" caret>Clickable inside</DropdownToggle>
            <DropdownMenu>
              <DropdownItem>Menu item</DropdownItem>
              <DropdownItem>Menu item</DropdownItem>
              <DropdownItem>Menu item</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <Dropdown autoClose="inside">
            <DropdownToggle color="warning" caret>Clickable outside</DropdownToggle>
            <DropdownMenu>
              <DropdownItem>Menu item</DropdownItem>
              <DropdownItem>Menu item</DropdownItem>
              <DropdownItem>Menu item</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <Dropdown autoClose={false}>
            <DropdownToggle color="danger" caret>Manually close</DropdownToggle>
            <DropdownMenu>
              <DropdownItem>Menu item</DropdownItem>
              <DropdownItem>Menu item</DropdownItem>
              <DropdownItem>Menu item</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </ButtonToolbar>
    </div>
  </div>
</Story>

<Story name="Theming">
  <div class="horizontal gap-xxl dropdown-example">
    <div class="drop-height">
      <Dropdown theme="dark" autoClose="manual" isOpen={true}>
        <DropdownToggle color="dark" caret>Dark Theme</DropdownToggle>
        <DropdownMenu>
          <DropdownItem header>Header</DropdownItem>
          <DropdownItem disabled>Action</DropdownItem>
          <DropdownItem>Another Action</DropdownItem>
          <DropdownItem divider />
          <DropdownItem>Another Action</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
    <div class="drop-height">
      <Dropdown theme="light" autoClose="manual" isOpen={true}>
        <DropdownToggle color="light" caret>Light Theme</DropdownToggle>
        <DropdownMenu>
          <DropdownItem header>Header</DropdownItem>
          <DropdownItem disabled>Action</DropdownItem>
          <DropdownItem>Another Action</DropdownItem>
          <DropdownItem divider />
          <DropdownItem>Another Action</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  </div>
</Story>

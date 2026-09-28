<script context="module">
  import Navbar from './Navbar.svelte';

  export const meta = {
    title: 'Stories/Navbar',
    component: Navbar,
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
      color: {
        control: {
          type: 'select'
        },
        options: [
          '',
          'primary',
          'secondary',
          'success',
          'danger',
          'warning',
          'info',
          'light',
          'dark',
          'primary-subtle',
          'secondary-subtle',
          'success-subtle',
          'danger-subtle',
          'warning-subtle',
          'info-subtle',
          'light-subtle',
          'dark-subtle'
        ]
      },
      container: {
        control: {
          type: 'select'
        },
        options: ['sm', 'md', 'lg', 'xl', 'xxl', 'fluid']
      },
      dark: {
        control: 'boolean'
      },
      expand: {
        control: ''
      },
      fixed: {
        control: ''
      },
      light: {
        control: 'boolean'
      },
      sticky: {
        control: ''
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
      class: '',
      container: 'xl',
      color: 'light',
      dark: false,
      expand: 'md',
      fixed: '',
      light: true,
      sticky: '',
      theme: null
    }
  };
</script>

<script>
  import { Story, Template } from '@storybook/addon-svelte-csf';

  import {
    Collapse,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink,
    Dropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem
  } from '@sveltestrap/sveltestrap';

  let isOpen = false;

  function handleUpdate(event) {
    isOpen = event.detail.isOpen;
  }

  const toggle = () => (isOpen = !isOpen);

  const widths = ['sm', 'md', 'lg', 'xl', 'xxl', 'fluid'];

  const colors = [
    'primary',
    'secondary',
    'success',
    'danger',
    'warning',
    'info',
    'light',
    'dark',
    'primary-subtle',
    'secondary-subtle',
    'success-subtle',
    'danger-subtle',
    'warning-subtle',
    'info-subtle',
    'light-subtle',
    'dark-subtle'
  ];
</script>

<Story name="Basic" let:args>
  <Navbar {...args}>
    <NavbarBrand href="/">sveltestrap</NavbarBrand>
    <NavbarToggler on:click={() => (isOpen = !isOpen)} />
    <Collapse {isOpen} navbar expand="md" on:update={handleUpdate}>
      <Nav class="ms-auto" navbar>
        <NavItem>
          <NavLink href="#components/">Components</NavLink>
        </NavItem>
        <NavItem>
          <NavLink href="https://github.com/sveltestrap/sveltestrap">GitHub</NavLink>
        </NavItem>
        <Dropdown nav inNavbar>
          <DropdownToggle nav caret>Options</DropdownToggle>
          <DropdownMenu end>
            <DropdownItem>Option 1</DropdownItem>
            <DropdownItem>Option 2</DropdownItem>
            <DropdownItem divider />
            <DropdownItem>Reset</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </Nav>
    </Collapse>
  </Navbar>
</Story>

<Story name="Colors">
  {#each colors as color}
    <Navbar
      {color}
      dark={color === 'dark' || color === 'primary'}
      light={color !== 'dark' && color !== 'primary'}
      class="mb-2"
    >
      <NavbarBrand href="/">{color} Navbar</NavbarBrand>
    </Navbar>
  {/each}
</Story>

<Story name="Sizes">
  {#each widths as width}
    <Navbar color="light" light expand="md" container={width} class="mb-2">
      <NavbarBrand href="/">NavBar with {width} container</NavbarBrand>
      <NavbarToggler on:click={() => (isOpen = !isOpen)} />
      <Collapse {isOpen} navbar expand="md" on:update={handleUpdate}>
        <Nav class="ms-auto" navbar>
          <NavItem>
            <NavLink href="#components/">Components</NavLink>
          </NavItem>
          <NavItem>
            <NavLink href="https://github.com/sveltestrap/sveltestrap">GitHub</NavLink>
          </NavItem>
          <Dropdown nav inNavbar>
            <DropdownToggle nav caret>Options</DropdownToggle>
            <DropdownMenu end>
              <DropdownItem>Option 1</DropdownItem>
              <DropdownItem>Option 2</DropdownItem>
              <DropdownItem divider />
              <DropdownItem>Reset</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </Nav>
      </Collapse>
    </Navbar>
  {/each}
</Story>

<Story name="Toggler">
  <Navbar color="light" light>
    <NavbarBrand href="/" class="me-auto">sveltestrap</NavbarBrand>
    <NavbarToggler on:click={toggle} class="me-2" />
    <Collapse {isOpen} navbar>
      <Nav navbar>
        <NavItem>
          <NavLink href="#components/">Components</NavLink>
        </NavItem>
        <NavItem>
          <NavLink href="https://github.com/sveltestrap/sveltestrap">GitHub</NavLink>
        </NavItem>
      </Nav>
    </Collapse>
  </Navbar>
</Story>

<Story name="Theming">
  <Navbar color="dark" theme="dark">
    <NavbarBrand href="/" class="me-auto">sveltestrap</NavbarBrand>
    <NavbarToggler on:click={toggle} class="me-2" />
    <Collapse {isOpen} navbar>
      <Nav navbar>
        <NavItem>
          <NavLink href="#components/">Components</NavLink>
        </NavItem>
        <NavItem>
          <NavLink href="https://github.com/sveltestrap/sveltestrap">GitHub</NavLink>
        </NavItem>
      </Nav>
    </Collapse>
  </Navbar>

  <Navbar color="light" theme="light">
    <NavbarBrand href="/" class="me-auto">sveltestrap</NavbarBrand>
    <NavbarToggler on:click={toggle} class="me-2" />
    <Collapse {isOpen} navbar>
      <Nav navbar>
        <NavItem>
          <NavLink href="#components/">Components</NavLink>
        </NavItem>
        <NavItem>
          <NavLink href="https://github.com/sveltestrap/sveltestrap">GitHub</NavLink>
        </NavItem>
      </Nav>
    </Collapse>
  </Navbar>
</Story>

<script context="module">
  import Styles from './Styles.svelte';

  export const meta = {
    title: 'Stories/Styles',
    component: Styles
  };
</script>

<script>
  import { Story } from '@storybook/addon-svelte-csf';

  import {
    Button,
    Icon,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    ThemeToggler,
    colorMode,
    toggleColorMode,
    useColorMode
  } from '@sveltestrap/sveltestrap';

  let theme = $colorMode;
</script>

<Story name="Basic">
  <Styles />

  <Button color="primary">
    Nice! <Icon name="emoji-smile-fill" />
  </Button>
</Story>

<Story name="Theme">
  <Styles {theme} />

  <div class="horizontal style-example">
    <Dropdown isOpen={true} autoClose="manual">
      <DropdownToggle caret>Menu</DropdownToggle>
      <DropdownMenu>
        <DropdownItem>Another Action</DropdownItem>
        <DropdownItem>Another Action</DropdownItem>
      </DropdownMenu>
    </Dropdown>

    <Button color="primary" outline active={$colorMode === 'light'} on:click={() => ($colorMode = 'light')}>
      light <Icon name="sun-fill" />
    </Button>
    <Button color="primary" outline active={$colorMode === 'dark'} on:click={() => ($colorMode = 'dark')}>
      dark <Icon name="moon-stars-fill" />
    </Button>
    <Button color="primary" outline active={$colorMode === 'auto'} on:click={() => ($colorMode = 'auto')}>
      auto <Icon name="circle-half" />
    </Button>
  </div>
</Story>

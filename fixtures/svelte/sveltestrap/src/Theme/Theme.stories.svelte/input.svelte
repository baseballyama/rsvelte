<script context="module">
  import Theme from './Theme.svelte';

  export const meta = {
    title: 'Stories/Theme',
    component: Theme
  };
</script>

<script>
  import { Story } from '@storybook/addon-svelte-csf';

  import {
    Button,
    Card,
    CardBody,
    CardHeader,
    CardFooter,
    CardSubtitle,
    CardText,
    CardTitle,
    Toast,
    ThemeToggler,
    Icon,
    colorMode,
    useColorMode
  } from '@sveltestrap/sveltestrap';
</script>

<Story name="Basic">
  <Theme theme="dark">
    <Card class="mb-3">
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

    <Toast body header="Dark Theme" style="--bs-toast-color: #fff;" isOpen={true}>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
      consequat.
    </Toast>
  </Theme>
</Story>

<Story name="Hook">
  <Button color="primary" outline active={$colorMode === 'light'} on:click={() => useColorMode('light')}>
    light <Icon name="sun-fill" />
  </Button>
  <Button color="primary" outline active={$colorMode === 'dark'} on:click={() => useColorMode('dark')}>
    dark <Icon name="moon-stars-fill" />
  </Button>
  <Button color="primary" outline active={$colorMode === 'auto'} on:click={() => useColorMode('auto')}>
    auto <Icon name="circle-half" />
  </Button>
</Story>

<Story name="Store">
  <Button color="primary" outline active={$colorMode === 'light'} on:click={() => ($colorMode = 'light')}>
    light <Icon name="sun-fill" />
  </Button>
  <Button color="primary" outline active={$colorMode === 'dark'} on:click={() => ($colorMode = 'dark')}>
    dark <Icon name="moon-stars-fill" />
  </Button>
  <Button color="primary" outline active={$colorMode === 'auto'} on:click={() => ($colorMode = 'auto')}>
    auto <Icon name="circle-half" />
  </Button>
</Story>

<Story name="Toggler">
  <ThemeToggler let:currentColorMode let:toggleColorMode>
    <Button color="primary" on:click={() => toggleColorMode()}>Toggle Theme: {currentColorMode}</Button>
  </ThemeToggler>

  <Card class="mt-3">
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
</Story>

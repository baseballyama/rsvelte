<script context="module">
  import Fade from './Fade.svelte';

  export const meta = {
    title: 'Stories/Fade',
    component: Fade,
    parameters: {},
    argTypes: {
      class: {
        className: 'string',
        table: { disable: true }
      },
      isOpen: {
        control: 'boolean'
      },
      toggler: {
        control: { disable: true }
      }
    },
    args: {
      isOpen: false
    }
  };
</script>

<script>
  import { Story, Template } from '@storybook/addon-svelte-csf';
  import { Button, Card } from '@sveltestrap/sveltestrap';

  let isOpen = false;
  let status = 'Closed';
</script>

<Template let:args>
  <div class="fade-example">
    <Button color="primary" on:click={() => (isOpen = !isOpen)} class="mb-3">Toggle</Button>
    <Fade {isOpen}>
      <div class="card-width">
        <Card body>
          Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. Nihil anim
          keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident.
        </Card>
      </div>
    </Fade>
  </div>
</Template>

<Story name="Basic" />

<Story name="Events">
  <div class="fade-example">
    <div class="text-content">
      <Button color="primary" on:click={() => (isOpen = !isOpen)} class="mb-3">Toggle</Button>

      <h5>Current state: {status}</h5>
    </div>
    <Fade
      {isOpen}
      on:opening={() => (status = 'Opening...')}
      on:open={() => (status = 'Opened')}
      on:closing={() => (status = 'Closing...')}
      on:close={() => (status = 'Closed')}
    >
      <div class="card-width">
        <Card body>
          Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. Nihil anim
          keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident.
        </Card>
      </div>
    </Fade>
  </div>
</Story>

<Story name="Uncontrolled">
  <div class="fade-example">
    <Button color="primary" id="toggler" class="mb-3">Toggle</Button>
    <Fade toggler="#toggler">
      <div class="card-width">
        <Card body>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt magni, voluptas debitis similique porro a
          molestias consequuntur earum odio officiis natus, amet hic, iste sed dignissimos esse fuga! Minus, alias.
        </Card>
      </div>
    </Fade>
  </div>
</Story>

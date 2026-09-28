<script context="module">
  import Image from './Image.svelte';

  export const meta = {
    title: 'Stories/Images',
    component: Image,
    parameters: {},
    argTypes: {
      class: {
        control: false,
        table: {
          disable: true
        }
      },
      alt: {
        control: 'text'
      },
      figure: {
        control: 'boolean'
      },
      fluid: {
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
      thumbnail: {
        control: 'boolean'
      },
      src: {
        control: false,
        table: {
          disable: true
        }
      }
    },
    args: {
      alt: '',
      fluid: false,
      theme: null,
      thumbnail: false
    }
  };
</script>

<script>
  import { Story, Template } from '@storybook/addon-svelte-csf';
  import { Figure } from '@sveltestrap/sveltestrap';

  const thumbnails = [
    'https://picsum.photos/100/100?random=' + Math.round(Math.random() * 1000),
    'https://picsum.photos/100/100?random=' + Math.round(Math.random() * 1000),
    'https://picsum.photos/100/100?random=' + Math.round(Math.random() * 1000)
  ];
</script>

<Template let:args>
  {#if args.figure}
    <Figure caption="This is a figure caption">
      <Image {...args} />
    </Figure>
  {:else}
    <Image {...args} />
  {/if}
</Template>

<Story
  name="Basic"
  args={{
    alt: '',
    fluid: false,
    thumbnail: false,
    figure: false,
    src: 'https://picsum.photos/id/155/1400/400.jpg'
  }}
/>

<Story
  name="Fluid"
  args={{ fluid: true, alt: 'This is a fluid Image', src: 'https://picsum.photos/id/518/1500/667.jpg' }}
/>

<Story name="Thumbnail">
  <div class="horizontal">
    {#each thumbnails as thumbnail}
      <Image thumbnail alt="This is a thumbnail Image" src={thumbnail} />
    {/each}
  </div>
</Story>

<Story name="Figures">
  <Figure caption="I believe this is a cow needing a haircut">
    <Image fluid alt="Landscape" src="https://picsum.photos/id/200/800/600" />
  </Figure>
</Story>

<Story name="Theming">
  <div class="horizontal">
    {#each thumbnails as thumbnail}
      <Image theme="dark" thumbnail alt="This is a thumbnail Image" src={thumbnail} />
    {/each}
  </div>

  <div class="horizontal">
    {#each thumbnails as thumbnail}
      <Image theme="light" thumbnail alt="This is a thumbnail Image" src={thumbnail} />
    {/each}
  </div>
</Story>

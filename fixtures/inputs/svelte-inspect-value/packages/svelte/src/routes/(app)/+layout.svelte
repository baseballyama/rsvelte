<script lang="ts">
  import { page } from '$app/state'
  import Inspect, { InspectOptionsProvider, type InspectOptions } from '$lib/index.js'
  import { DEV } from 'esm-env'
  import { setContext, type Snippet } from 'svelte'
  import { slide } from 'svelte/transition'
  import type { LayoutData } from './$types.js'
  import './app.css'
  import ExpandRoute from './Expandroute.svelte'
  import GlobalOptions from './GlobalOptions.svelte'
  import DocSearch from '$doclib/DocSearch.svelte'

  let navPanelOpen = $state(true)
  let renderDevOnlyStuff = $state(false)

  setContext(Symbol.for('SIV.DEBUG'), () => renderDevOnlyStuff)

  const { children, data }: { children: Snippet; data: LayoutData } = $props()

  type Route = {
    title: string
    children?: Route[]
    href?: string
    devonly?: boolean
    expandable?: true
  }

  const routes: Route[] = $derived(
    [
      {
        title: 'Reference',
        children: [
          {
            title: 'Getting Started',
            href: '/reference/getting-started',
          },
          {
            href: '/reference/panel',
            title: 'Panel',
          },
          {
            href: '/reference/values',
            title: 'Values',
          },
          {
            href: '/reference/examples',
            title: 'Examples',
          },
          { href: '/reference/custom', title: 'Custom components' },
        ],
      },

      {
        title: 'Usage',
        children: [
          {
            title: 'Hotkeys',
            href: '/usage/hotkeys',
          },
          {
            title: 'Search',
            href: '/usage/search',
          },
        ],
      },

      {
        title: 'Theming',
        children: [
          {
            title: 'Themes',
            href: '/theming/themes',
          },
          {
            href: '/theming/define',
            title: 'Define',
          },
          {
            href: '/theming/vars',
            title: 'Variables',
          },
        ],
      },
      data.docs && {
        title: 'TypeDoc',
        children: [
          {
            title: 'Types',
            expandable: true,
            href: '/docs/types',
            children: data.docs
              .filter((d) => ['types'].includes(d.type ?? '') && !d.title[1].includes('Custom'))
              .map((d) => ({
                title: d.title?.[1] ?? '',
                href: `/docs/${d.type}/${d.title[1]}`,
              })),
          },
          {
            title: 'Utility',
            expandable: true,
            href: '/docs/functions',
            children: data.docs
              .filter((d) => ['functions'].includes(d.type ?? ''))
              .map((d) => ({
                title: `${d.title?.[1] ?? ''}()`,
                href: `/docs/${d.type}/${d.title[1]}`,
              })),
          },
          {
            title: 'Variables',
            devonly: true,
            expandable: true,
            children: data.docs
              .filter((d) => ['variables'].includes(d.type ?? ''))
              .map((d) => ({
                title: d.title?.[1] ?? '',
                href: `/docs/${d.type}/${d.title[1]}`,
              })),
          },
        ],
      },
      // {
      //   title: 'Types',
      //   expandable: true,
      //   href: '/docs/types',
      //   children: data.docs
      //     .filter((d) => ['types'].includes(d.type ?? '') && !d.title[1].includes('Custom'))
      //     .map((d) => ({
      //       title: d.title?.[1] ?? '',
      //       href: `/docs/${d.type}/${d.title[1]}`,
      //     })),
      // },
      // {
      //   title: 'Utility',
      //   expandable: true,
      //   href: '/docs/functions',
      //   children: data.docs
      //     .filter((d) => ['functions'].includes(d.type ?? ''))
      //     .map((d) => ({
      //       title: `${d.title?.[1] ?? ''}()`,
      //       href: `/docs/${d.type}/${d.title[1]}`,
      //     })),
      // },
      // {
      //   title: 'Variables',
      //   devonly: true,
      //   expandable: true,
      //   children: data.docs
      //     .filter((d) => ['variables'].includes(d.type ?? ''))
      //     .map((d) => ({
      //       title: d.title?.[1] ?? '',
      //       href: `/docs/${d.type}/${d.title[1]}`,
      //     })),
      // },
      {
        href: '/testing',
        title: 'Testing',
        devonly: true,
        children: [
          { href: '/testing/alltypes', title: 'All Types', devonly: true },
          { href: '/testing/global', title: 'Global', devonly: true },
          { href: '/testing/search', title: 'Search', devonly: true },
        ],
      },
      {
        href: '/playground',
        title: 'Playground',
        devonly: true,
      },
      {
        href: '/releases',
        title: 'Releases',
        devonly: true,
      },
    ].filter(Boolean) as Route[]
  )

  const INSPECT_OPTIONS_DEFAULT: Partial<InspectOptions> = {
    theme: 'inspect',
    stringCollapse: 0,
    showTools: true,
    showTypes: true,
    showLength: true,
    showPreview: true,
    previewDepth: 1,
    previewEntries: 3,
    flashOnUpdate: true,
    noanimate: false,
    animRate: 1,
    quotes: 'single',
    borderless: false,
    embedMedia: true,
    elementView: 'simple',
    parseJson: false,
    renderIf: true,
    stores: 'full',
    search: false,
    highlightMatches: true,
    heading: false,
  }

  let options = $state<Partial<InspectOptions>>({
    theme: 'inspect',
    stringCollapse: 0,
    showTools: true,
    showTypes: true,
    showLength: true,
    showPreview: true,
    previewDepth: 1,
    previewEntries: 3,
    flashOnUpdate: true,
    noanimate: false,
    animRate: 1,
    quotes: 'single',
    borderless: false,
    embedMedia: true,
    elementView: 'simple',
    parseJson: false,
    renderIf: true,
    stores: 'full',
    search: false,
    highlightMatches: true,
    heading: false,
    hotkeys: true,
    typeToFocus: true,
    disableKeynav: false,
  })

  function onkeydown(event: KeyboardEvent & { currentTarget: EventTarget & Window }) {
    if (event.key === 'æ') {
      options.renderIf = !options.renderIf
    }
    if (event.key === 'ø') {
      renderDevOnlyStuff = !renderDevOnlyStuff
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setOption = (name: keyof InspectOptions, value: any) => {
    options[name] = value
  }

  setContext('set-global-option', setOption)

  let wiggleOnUpdate = $state(true)
</script>

<svelte:window {onkeydown} />

{#snippet entry(route: Route)}
  {@const active = page.url.pathname.includes(route.href ?? route.title.toLowerCase())}
  {#if !route.devonly || (route.devonly && DEV && renderDevOnlyStuff)}
    {#if route.expandable}
      <li>
        <ExpandRoute>
          {#snippet title()}
            <span class:active>{route.title}</span>
          {/snippet}
          {#snippet subRoutes(expanded)}
            {#if route.children && (expanded || active)}
              <ul transition:slide>
                {#each route.children as child (child.title)}
                  {@render entry(child)}
                {/each}
              </ul>
            {/if}
          {/snippet}
        </ExpandRoute>
      </li>
    {:else}
      <li>
        {#if route.href}
          <a class:active href={route.href}>{route.title}</a>
        {:else}
          <span class:active>{route.title}</span>
        {/if}
        {#if route.children}
          <ul>
            {#each route.children as child (child.title)}
              {@render entry(child)}
            {/each}
          </ul>
        {/if}
      </li>
    {/if}
  {/if}
{/snippet}

<InspectOptionsProvider {options}>
  <Inspect.Panel
    style="max-width: 230px; min-width: 230px; max-height: 100vh;"
    bind:open={navPanelOpen}
    persist="siv.nav-panel"
    align="left full"
    hideGlobalValues
    openOnHover
    hideToolbar
    resize={false}
  >
    <div class="drawer-content">
      <nav class="drawer-nav">
        <ul>
          <li><a style="font-size: 32px; line-height: 1" href="/">Home</a></li>
          {#each routes as route (route.title)}
            {@render entry(route)}
          {/each}
        </ul>
      </nav>

      <div style="display: flex; flex-direction: column;gap: 1em">
        <GlobalOptions bind:options onreset={() => (options = INSPECT_OPTIONS_DEFAULT)} />

        <div class="badges">
          <a
            href="https://www.npmjs.com/package/svelte-inspect-value"
            aria-label="npm"
            target="_blank"
          >
            <img alt="npm" src="https://img.shields.io/npm/v/svelte-inspect-value" />
          </a>

          <a href="https://github.com/ampled/svelte-inspect-value">
            <img
              alt="github"
              src="https://img.shields.io/github/stars/ampled/svelte-inspect-value?style=social"
            />
          </a>
          <a href="https://ko-fi.com/eirikk" title="support further development">
            <img
              alt="kofi"
              src="https://shields.io/badge/ko--fi-000000?logo=ko-fi&style=for-the-badgeKo-fi"
            />
          </a>
        </div>
      </div>
    </div>
  </Inspect.Panel>
  <Inspect.Panel
    heading="+layout.svelte"
    persist
    theme="stereo"
    renderIf={DEV && renderDevOnlyStuff}
    {wiggleOnUpdate}
    values={{ options, page: { ...page } }}
  />

  <svelte:boundary>
    {#snippet failed(error, reset)}
      <Inspect value={error} />
      <button onclick={reset}>reset</button>
    {/snippet}
    <main class:drawer-open={navPanelOpen}>
      <header>
        <a href="/" class="title">
          <h1 aria-label="Svelte Inspect Value" class="header-lib-title">
            Svelte
            <code
              >&lt;<span class="inspect">Inspect</span>
              {'{'}<span class="value">value</span>} /&gt;
            </code>
          </h1>
        </a>
        <DocSearch />
      </header>
      {@render children()}
    </main>
  </svelte:boundary>
</InspectOptionsProvider>

<style>
  header {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: flex-end;
    gap: 1em;
    view-transition-name: header;
    /* padding-inline: 1em; */
    padding-top: 1em;
  }

  .title {
    width: max-content;
    font-weight: bold;
    font-size: 0.8rem;
    text-decoration: none;
  }

  h1.header-lib-title {
    max-width: max-content;
    text-decoration: none;
    text-wrap: nowrap;
    white-space: nowrap;
  }

  main {
    display: flex;
    position: relative;
    flex-direction: column;
    gap: 0.5em;
    transition: all 200ms ease-in-out;
    margin-bottom: 150px;
    padding-top: 0.5em;
    padding-left: 3em;
    width: 100%;
  }

  nav {
    /* padding-top: 0.5em; */
    view-transition-name: nav;
    padding-left: 0.5rem;
  }

  nav:not(.drawer-nav) {
    ul {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      gap: 1em;
      padding: 0;

      li {
        display: inline;
        list-style-type: none;
      }
    }
  }

  a {
    transition: color 300ms linear;
    color: #fafafa;
    line-height: 1;
    text-decoration: none;
    white-space: nowrap;

    h1 {
      text-decoration: none;

      code {
        background: transparent;
        padding-inline: 0.2em;
        font-weight: normal;
        font-size: 0.8em;

        .inspect {
          color: var(--red);
          font-weight: bold;
        }

        .value {
          color: var(--blue);
          font-weight: normal;
        }
      }
    }
  }

  a.active,
  span.active {
    /* text-decoration: underline; */
    position: relative;
    color: var(--red);
  }

  @media (min-width: 768px) {
    main {
      /* padding-left: 3em; */
      padding-top: 0.5em;
      padding-right: 2rem;
      width: 90%;
    }

    main.drawer-open {
      padding-right: 2rem;
      padding-left: calc(3em + 230px);
      width: 100%;
    }

    .title {
      font-size: 1.5rem;
    }
  }

  @media (min-width: 1024px) {
    main {
      /* padding-left: 1em; */
      padding-right: 3em;
      width: 90%;
    }

    .title {
      font-size: 1.5rem;
    }
  }

  /* VIEW TRANSITIONS */
  @keyframes fade-in {
    from {
      opacity: 0;
    }
  }

  @keyframes fade-out {
    to {
      opacity: 0;
    }
  }

  @keyframes slide-from-right {
    from {
      transform: translateX(30px);
    }
  }

  @keyframes slide-to-left {
    to {
      transform: translateX(-30px);
    }
  }

  :root::view-transition-old(root) {
    animation:
      90ms cubic-bezier(0.4, 0, 1, 1) both fade-out,
      300ms cubic-bezier(0.4, 0, 0.2, 1) both slide-to-left;
  }

  :root::view-transition-new(root) {
    animation:
      210ms cubic-bezier(0, 0, 0.2, 1) 90ms both fade-in,
      300ms cubic-bezier(0.4, 0, 0.2, 1) both slide-from-right;
  }

  .badges {
    display: flex;
    gap: 1ch;
    width: 100%;
    /* justify-content: flex-end; */
  }

  nav.drawer-nav {
    /* font-size: 16px; */
    overflow-y: auto;
    font-family: 'EB Garamond', serif;

    ul {
      display: flex;
      flex-direction: column;
      padding: 0;
      font-weight: bold;
      font-size: 18px;
      /* margin-bottom: 1em; */

      ul {
        padding-left: 1ch;
        font-weight: normal;
        font-size: 18px;

        ul {
          font-size: 12px;
          font-family: monospace;

          /* li::before {
            content: '- ';
          } */
        }
      }
    }

    ul li a,
    ul li span {
      color: var(--_text-color) !important;
      line-height: 1.5;

      &:hover:not(span) {
        text-decoration: underline;
      }
    }

    ul li span {
      font-weight: bold;
    }

    ul li a.active,
    ul li span.active {
      color: var(--red) !important;
    }

    li {
      list-style-type: none;
    }
  }

  .drawer-content {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
  }
</style>

<script lang="ts">
  import Component, { ListItem } from "./lib/Component.svelte"; // Component: __sveltets_2_IsomorphicComponent<__sveltets_2_PropsWithChildren<{ items?: ListItem[] | undefined; }, { default: { item: ListItem; }; count: { count: number; }; }>, { ...; }, { ...; }, Record<...>, string>, ListItem: any, ListItem: any

  const items: ListItem[] = [ // items: ListItem[]
    {
      title: "Svelte.dev", // title: string
      link: "https://svelte.dev", // link: string
    },
    {
      title: "TypeScript ESLint", // title: string
      link: "https://typescript-eslint.io", // link: string
    },
    {
      title: "TypeScript", // title: string
      link: "https://www.typescriptlang.org", // link: string
    },
  ];
</script>

<main>
  <Component {items} let:item> <!-- Component: __sveltets_2_IsomorphicComponent<__sveltets_2_PropsWithChildren<{ items?: ListItem[] | undefined; }, { default: { item: ListItem; }; count: { count: number; }; }>, { ...; }, { ...; }, Record<...>, string>, items: ListItem[], items: ListItem[], item: ListItem -->
    <div>
      {item.title} <!-- item.title: string -->
    </div>
  </Component>
  <Component {items}> <!-- Component: __sveltets_2_IsomorphicComponent<__sveltets_2_PropsWithChildren<{ items?: ListItem[] | undefined; }, { default: { item: ListItem; }; count: { count: number; }; }>, { ...; }, { ...; }, Record<...>, string>, items: ListItem[], items: ListItem[] -->
    <div let:item> <!-- item: ListItem -->
      {item.title} <!-- item.title: string -->
    </div>
    <span slot="count" let:count={foo}> <!-- foo: number -->
      {foo} <!-- foo: number -->
    </span>
  </Component>
</main>

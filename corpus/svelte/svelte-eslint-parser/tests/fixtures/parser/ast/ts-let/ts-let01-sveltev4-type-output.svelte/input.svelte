<script lang="ts">
  import Component, { ListItem } from "./lib/Component.svelte"; // Component: typeof SvelteComponent, ListItem: any, ListItem: any

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
  <Component {items} let:item> <!-- Component: typeof SvelteComponent, items: ListItem[], items: ListItem[], item: any -->
    <div>
      {item.title} <!-- item.title: any -->
    </div>
  </Component>
  <Component {items}> <!-- Component: typeof SvelteComponent, items: ListItem[], items: ListItem[] -->
    <div let:item> <!-- item: any -->
      {item.title} <!-- item.title: any -->
    </div>
    <span slot="count" let:count={foo}> <!-- foo: any -->
      {foo} <!-- foo: any -->
    </span>
  </Component>
</main>

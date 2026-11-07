<script lang="ts">
  import Component, { ListItem } from "./lib/Component.svelte";

  const items: ListItem[] = [
    {
      title: "Svelte.dev",
      link: "https://svelte.dev",
    },
    {
      title: "TypeScript ESLint",
      link: "https://typescript-eslint.io",
    },
    {
      title: "TypeScript",
      link: "https://www.typescriptlang.org",
    },
  ];
</script>

<main>
  <Component {items} let:item>
    <div>
      {item.title}
    </div>
  </Component>
  <Component {items}>
    <div let:item>
      {item.title}
    </div>
    <span slot="count" let:count={foo}>
      {foo}
    </span>
  </Component>
</main>

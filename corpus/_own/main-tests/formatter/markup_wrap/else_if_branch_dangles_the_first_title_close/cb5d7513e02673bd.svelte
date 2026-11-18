<svg>
  {#if typeof title === "function"}<title>{@render title()}</title>{:else if titleText}<title>{titleText}</title>{/if}
  {@render children?.()}
</svg>

<div class="a">a</div>

<style>
  .a {
    background: url("data:image/svg+xml;utf8,<svg></svg>") no-repeat;
    background-image: linear-gradient(to right, rgb(0 0 0 / 50%), #fff);
    grid-template-areas:
      "head head"
      "nav  main";
    grid-template-columns: repeat(auto-fill, minmax(1px, 1fr));
    font:
      italic small-caps bold 1rem/1.5 "X",
      serif;
    transition: color 0.2s cubic-bezier(0.4, 0, 0.2, 1) 0s;
    transform: translate3d(1px, 2px, 3px) rotate(45deg) scale(1.5);
    width: clamp(1px, 50%, 10px);
    color: color-mix(in srgb, red 50%, blue);
    content: 'a"b';
    margin: calc(100% - var(--x, 1px) * 2);
  }
</style>

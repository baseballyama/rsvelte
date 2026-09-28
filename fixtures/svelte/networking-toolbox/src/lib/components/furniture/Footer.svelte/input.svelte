<script>
  import { footerLinks } from '$lib/constants/nav';
  import { site, author, license } from '$lib/constants/site';
</script>

<footer class="footer">
  <!-- <p>
    Built with 🩷 and 🍺 by
    <a href="https://github.com/lissy93" target="_blank" rel="noopener noreferrer">Lissy93</a>.
    <a href="https://github.com/lissy93/networking-toolbox" target="_blank" rel="noopener noreferrer">View on GitHub</a>
  </p> -->
  <p class="footer-sub">
    <a href={site.url} target="_blank" rel="noopener noreferrer">{site.title}</a>
    is licensed under
    <a href={license.url} target="_blank" rel="noopener noreferrer">{license.name}</a>, (C)
    <a href={author.githubUrl} target="_blank" rel="noopener noreferrer">{author.name}</a>
    {license.date}
  </p>
  <p class="footer-sub">
    {#each footerLinks as item, i (item.href)}
      <a href={item.href}>{item.label}</a>{i < footerLinks.length - 1 ? ' • ' : ''}
    {/each}
  </p>
</footer>

<style>
  .footer {
    text-align: center;
    padding: var(--spacing-sm) var(--spacing-lg);
    border-top: 1px solid var(--border-primary);
    margin-top: var(--spacing-xl);
    display: flex;
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
    flex-direction: row-reverse;
    margin: 0 auto;

    @media (max-width: 800px) {
      justify-content: center;
    }

    p {
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
      margin-bottom: var(--spacing-xs);
    }

    .footer-sub {
      font-size: var(--font-size-xs) !important;
      opacity: 0.8;
    }

    a {
      color: var(--color-primary);
      text-decoration: none;
      transition: color var(--transition-fast);

      &:hover {
        color: var(--color-primary-light);
        text-decoration: underline;
      }
    }
  }
</style>

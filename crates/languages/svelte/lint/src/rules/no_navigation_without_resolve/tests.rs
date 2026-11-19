use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::diagnostics::Severity;
use rsvelte_kernel::source::document::Document;

/// The lines `svelte/no-navigation-without-resolve` reports in a page of a Kit 2 project whose
/// script imports `resolve` and declares `declarations`, then has `template`.
fn reported_lines(declarations: &str, template: &str) -> Vec<usize> {
    let source_text = format!(
        "<script lang=\"ts\">\n\timport {{ resolve }} from '$app/paths';\n{declarations}\n\
         </script>\n{template}\n"
    );
    let mut registry = Registry::new();
    crate::register(&mut registry);
    crate::project::register_without_files(&mut registry);
    let document = Document::new("Page.svelte".to_owned(), source_text.clone()).expect("source");
    let context = DocumentContext::new(&document, registry.artifacts());
    let mut configuration = crate::Configuration::new(crate::LintSettings::default());
    configuration
        .rule(
            "svelte/no-navigation-without-resolve",
            Severity::Error,
            &[],
            &[],
        )
        .expect("a known rule");
    let findings = crate::lint(&context, &configuration).expect("source parses");
    findings
        .iter()
        .map(|f| {
            source_text[..f.diagnostic.span.start_offset as usize]
                .lines()
                .count()
        })
        .collect()
}

const NONE: [usize; 0] = [];

/// typescript-eslint gives these `href`s the type `ResolvedPathname`, which upstream accepts with
/// type information; the rule reads the values instead.
#[test]
fn an_href_an_each_item_takes_from_resolve_is_accepted() {
    let links = "\tconst links = [{ href: resolve('/'), name: 'Home' }];";
    let template = concat!(
        "{#each links as { href, name } (href)}\n\t<a {href}>{name}</a>\n{/each}\n",
        "{#each links as link (link.href)}\n\t<a href={link.href}>{link.name}</a>\n{/each}",
    );
    assert_eq!(reported_lines(links, template), NONE);
    let nav = concat!(
        "\tconst home = resolve('/');\n",
        "\tconst nav = { home, groups: [{ links: [{ href: home }] }] };",
    );
    let template = concat!(
        "<a href={nav.home}>x</a>\n",
        "{#each nav.groups as group}{#each group.links as { href }}",
        "<a {href}>x</a>{/each}{/each}",
    );
    assert_eq!(reported_lines(nav, template), NONE);
    let through = "\tconst nav = { links: [{ href: resolve('/') }] };\n\tconst links = nav.links;";
    let template = "{#each links as link}<a href={link.href}>x</a>{/each}";
    assert_eq!(reported_lines(through, template), NONE);
}

#[test]
fn an_href_whose_values_are_not_all_known_to_come_from_resolve_is_reported() {
    let template = "{#each links as link}<a href={link.href}>x</a>{/each}";
    for declarations in [
        "\tconst links = [{ href: resolve('/') }, { href: '/x' }];",
        "\tconst links = [{ href: resolve('/') }, { name: 'x' }];",
        "\tconst links = [{ href: resolve('/') }, ...more];",
        "\tconst links = makeLinks();",
        "\tlet links = [{ href: resolve('/') }];",
        "\tconst links = [{ href: resolve('/') }];\n\tlinks.push({ href: '/x' });",
        "\tconst links = [{ href: resolve('/') }];\n\tlinks[0].href = '/x';",
        "\tconst links = [{ href: resolve('/') }];\n\tchange(links);",
        "\tconst nav = { links: [{ href: resolve('/') }] };\n\tconst links = nav.links;\n\
         \tnav.links.push({ href: '/x' });",
    ] {
        let lines = reported_lines(declarations, template);
        assert_eq!(lines.len(), 1, "{declarations}: {lines:?}");
    }
    let links = "\tconst links = [{ href: resolve('/') }];";
    // A default value can be what the link gets.
    let template = "{#each links as { href = '/x' }}<a {href}>x</a>{/each}";
    assert_eq!(reported_lines(links, template), [5]);
    // The template changes the item.
    let template = concat!(
        "{#each links as link}",
        "<a href={link.href} onclick={() => (link.href = '/x')}>x</a>{/each}",
    );
    assert_eq!(reported_lines(links, template), [5]);
}

/// What upstream reports without type information stays reported.
#[test]
fn hrefs_without_resolve_are_reported() {
    let declarations = "\tconst links = [{ href: '/about', name: 'Home' }];\n\tconst h = '/x';";
    let template = concat!(
        "<a href={h}>x</a>\n<a href=\"/y\">y</a>\n",
        "{#each links as link (link.href)}\n\t<a href={link.href}>{link.name}</a>\n{/each}",
    );
    assert_eq!(reported_lines(declarations, template), [6, 7, 9]);
}

/// Upstream accepts an absolute, fragment or empty literal only as the URL itself or a constant's
/// initializer; reached through an item or a member it is reported, typed or not.
#[test]
fn a_literal_url_reached_through_an_item_or_a_member_is_reported() {
    let declarations = concat!(
        "\tconst links = [{ href: 'https://example.com' }];\n",
        "\tconst mixed = [{ href: resolve('/') }, { href: 'https://example.com' }];\n",
        "\tconst frag = [{ href: resolve('/') }, { href: '#top' }];\n",
        "\tconst nav = { home: 'https://example.com', top: '#top' };",
    );
    let template = concat!(
        "{#each links as link}<a href={link.href}>x</a>{/each}\n",
        "{#each mixed as link}<a href={link.href}>x</a>{/each}\n",
        "{#each frag as { href }}<a {href}>x</a>{/each}\n",
        "<a href={nav.home}>x</a>\n<a href={nav.top}>x</a>",
    );
    assert_eq!(reported_lines(declarations, template), [8, 9, 10, 11, 12]);
}

/// `pushState('')` is allowed as written or through a constant, not through a member.
#[test]
fn an_empty_url_reached_through_a_member_is_reported() {
    let declarations = concat!(
        "\timport { pushState } from '$app/navigation';\n",
        "\tconst nav = { p: '' };\n\tconst p = nav.p;\n\tpushState(p, {});\n",
        "\tconst e = '';\n\tpushState(e, {});",
    );
    assert_eq!(reported_lines(declarations, ""), [6]);
}

/// typescript-eslint types these `href`s `ResolvedPathname | null`, which upstream accepts.
#[test]
fn a_nullish_item_beside_resolve_is_accepted() {
    let declarations = "\tconst links = [{ href: resolve('/') }, { href: null }];";
    let template = "{#each links as link}<a href={link.href}>x</a>{/each}";
    assert_eq!(reported_lines(declarations, template), NONE);
}

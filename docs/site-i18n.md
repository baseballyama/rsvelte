# Site languages: Japanese and English

The site in `apps/site` shows every page in Japanese and in English. This file is the specification of the
language, URL, anchor and text-table rules, with Dafny proofs of the parts that can be stated as math.

- Proofs: each ` ```dafny:Name.dfy ` block stands alone and follows the section it checks. Run them with
  [How to run the proofs](#how-to-run-the-proofs). They are not run in CI.
- Not proved: natural English, layout, keyboard use and browser behavior. These are checked by tests, a browser and
  review (see [What the proofs do not cover](#what-the-proofs-do-not-cover)).
- Code: `apps/site/src/lib/i18n.ts`, `src/hooks.ts`, `src/hooks.server.ts`, `src/lib/site.ts`, `src/lib/terms.ts`,
  `svelte.config.js`, `scripts/lint-english.mjs`, `scripts/check-prerender.mjs`.

## Routes and language

Every Japanese page path `p` has one English path: `/en` + `p`, and `/` becomes `/en`. Japanese paths do not change.
The URL path is the only source of the reader's language: no cookie, no stored choice, no `Accept-Language`.

| Rule | Code |
|---|---|
| `langOf(p)` is English for `/en` and paths that start with `/en/`, Japanese otherwise (`/enx` is Japanese) | `i18n.ts` |
| `pathWithoutLang(p)` removes `/en`; `/en` and `/en/` give `/` | `i18n.ts` |
| `localizedPath(p, lang)` adds `/en` to a shared path; a `#` or `?` right after `/` stays after `/en` | `i18n.ts` |
| `reroute` resolves an English path to the shared route | `hooks.ts` |
| `<html lang>` is `langOf(pathname)` for server rendering, prerendering and the no-SSR shell | `hooks.server.ts` |

A shared path starts with `/` and then a character that is not `/` or `\` (or is `/` alone), is Japanese by
`langOf`, and has no `#` or `?` (it is a pathname).

#### Formal check: paths [INV-01, INV-02, INV-03, INV-04, INV-05, PRE-04, ALG-01, TYP-01]

```dafny:LanguagePaths.dfy
// [TYP-01] The two languages; every function below is total over them.
datatype Lang = Ja | En

const Prefix: string := "/en"

// [ALG-01] i18n.ts langOf
function LangOf(p: string): Lang {
  if p == Prefix || Prefix + "/" <= p then En else Ja
}

// [ALG-01] i18n.ts pathWithoutLang: `pathname.slice(PREFIX.length) || '/'`
function PathWithoutLang(p: string): string {
  if LangOf(p) == En then (if p[|Prefix|..] == "" then "/" else p[|Prefix|..]) else p
}

// [ALG-01] i18n.ts localizedPath
function LocalizedPath(path: string, lang: Lang): string {
  if lang == Ja then path
  else if path == "/" || (|path| >= 2 && path[0] == '/' && (path[1] == '#' || path[1] == '?')) then Prefix + path[1..]
  else Prefix + path
}

// A same-origin absolute path: `/`, or `/` and then a character that is not `/` or `\`.
predicate OnSite(p: string) {
  |p| >= 1 && p[0] == '/' && (|p| == 1 || (p[1] != '/' && p[1] != '\\'))
}

// [PRE-04] What callers pass to localizedPath.
predicate SharedPath(p: string) {
  OnSite(p) && LangOf(p) == Ja && forall i :: 0 <= i < |p| ==> p[i] != '#' && p[i] != '?'
}

// A query or a hash that follows a pathname.
predicate Suffix(s: string) {
  s == "" || s[0] == '#' || s[0] == '?'
}

// [ALG-01] hooks.ts reroute, then the route the router resolves.
function Resolved(p: string): string {
  if LangOf(p) == En then PathWithoutLang(p) else p
}

// [INV-05] hooks.server.ts replaces %lang% with langOf(pathname).
function HtmlLang(pathname: string): Lang { LangOf(pathname) }

// [INV-02] The prefix boundary.
lemma Boundary()
  ensures LangOf("/") == Ja && LangOf("/en") == En && LangOf("/en/") == En && LangOf("/en/why") == En
  ensures LangOf("/enx") == Ja && LangOf("/english") == Ja && LangOf("/why") == Ja && LangOf("") == Ja
  ensures PathWithoutLang("/en") == "/" && PathWithoutLang("/en/") == "/" && PathWithoutLang("/en/why") == "/why"
{
  assert (Prefix + "/")[3] == '/' && "/enx"[3] == 'x' && "/english"[3] == 'g';
  assert !(Prefix + "/" <= "/enx");
  assert !(Prefix + "/" <= "/english");
}

// [INV-03] A shared path comes back unchanged, in the requested language.
lemma RoundTrip(p: string, lang: Lang)
  requires SharedPath(p)
  ensures LangOf(LocalizedPath(p, lang)) == lang
  ensures PathWithoutLang(LocalizedPath(p, lang)) == p
{
  if lang == En {
    if p == "/" {
      assert LocalizedPath(p, lang) == Prefix;
    } else {
      assert |p| >= 2 ==> p[1] != '#' && p[1] != '?';
      var q := LocalizedPath(p, lang);
      assert q == Prefix + p;
      assert Prefix + "/" <= q;
      assert q[|Prefix|..] == p;
    }
  }
}

// [INV-01] Each shared path has exactly one path per language.
lemma Injective(a: string, b: string, lang: Lang)
  requires SharedPath(a) && SharedPath(b)
  requires LocalizedPath(a, lang) == LocalizedPath(b, lang)
  ensures a == b
{
  RoundTrip(a, lang);
  RoundTrip(b, lang);
}

// [INV-01] An English path never equals a Japanese path.
lemma LanguagesDisjoint(a: string, b: string)
  requires SharedPath(a) && SharedPath(b)
  ensures LocalizedPath(a, En) != LocalizedPath(b, Ja)
{
  RoundTrip(a, En);
  RoundTrip(b, Ja);
}

// A query or a hash written after the pathname passes through unchanged.
lemma SuffixKept(p: string, s: string, lang: Lang)
  requires SharedPath(p) && Suffix(s)
  ensures LocalizedPath(p + s, lang) == LocalizedPath(p, lang) + s
{
  if lang == En && p != "/" {
    assert |p| >= 2;
    assert (p + s)[0] == '/' && (p + s)[1] == p[1];
    assert p[1] != '#' && p[1] != '?';
    assert p + s != "/";
  }
  if lang == En && p == "/" && s != "" {
    assert (p + s)[1..] == s;
  }
}

// [INV-04] Both URLs of a page resolve to the same route.
lemma SameRoute(p: string, lang: Lang)
  requires SharedPath(p)
  ensures Resolved(LocalizedPath(p, lang)) == p
{
  RoundTrip(p, lang);
}

// [INV-05] The document language follows the URL.
lemma DocumentLanguage(p: string, lang: Lang)
  requires SharedPath(p)
  ensures HtmlLang(LocalizedPath(p, lang)) == lang
{
  RoundTrip(p, lang);
}
```

## Language switch

The header has one link to the same page in the other language. Its text is `English` on Japanese pages and
`日本語` (with `lang="ja"`) on English pages. The link has `data-sveltekit-reload`, so a switch is always a full page
load: every layout, the search index and `<html lang>` come from the server in the new language.

- Server href: `switchPath(page.url.pathname, other)`, which is `localizedPath(pathWithoutLang(pathname), other)`.
  It reads only the pathname, because SvelteKit throws when a prerendered page reads `url.search`.
- The header renders on every path, including a 404 such as `/en//evil.example/x`. A shared path that does not
  start with `/` followed by a character other than `/` or `\` would be a link to another host, so `switchPath`
  uses `/` for it. Both hrefs are always same-origin absolute paths.
- Browser href: one handler on `pointerenter`, `pointerdown`, `focus` and `click` writes
  `switchHref(location, other)` to the link's `href`: the server href plus `location.search` and `location.hash`.
  This keeps a hash written with `replaceState` (the playground keeps its state there).
- Below the `sm` width the header hides its GitHub link (the footer has one), so the switch fits at 320 px.

#### Formal check: the switch [POST-01, POST-02, STT-01, STT-02, PRE-04]

```dafny:LanguageSwitch.dfy
datatype Lang = Ja | En

const Prefix: string := "/en"

function LangOf(p: string): Lang {
  if p == Prefix || Prefix + "/" <= p then En else Ja
}

function PathWithoutLang(p: string): string {
  if LangOf(p) == En then (if p[|Prefix|..] == "" then "/" else p[|Prefix|..]) else p
}

function LocalizedPath(path: string, lang: Lang): string {
  if lang == Ja then path
  else if path == "/" || (|path| >= 2 && path[0] == '/' && (path[1] == '#' || path[1] == '?')) then Prefix + path[1..]
  else Prefix + path
}

// A same-origin absolute path: `/`, or `/` and then a character that is not `/` or `\`.
predicate OnSite(p: string) {
  |p| >= 1 && p[0] == '/' && (|p| == 1 || (p[1] != '/' && p[1] != '\\'))
}

predicate SharedPath(p: string) {
  OnSite(p) && LangOf(p) == Ja && forall i :: 0 <= i < |p| ==> p[i] != '#' && p[i] != '?'
}

predicate Suffix(s: string) {
  s == "" || s[0] == '#' || s[0] == '?'
}

function Other(lang: Lang): Lang { if lang == Ja then En else Ja }

// i18n.ts switchPath: a shared path that is not on this site (`//host`, `/\host`) becomes `/`.
// The code tests the regex /^\/[^/\\]|^\/$/, which is OnSite.
function SwitchPath(pathname: string, lang: Lang): string {
  var route := PathWithoutLang(pathname);
  LocalizedPath(if OnSite(route) then route else "/", lang)
}

// [POST-01] SiteHeader server href: switchPath(page.url.pathname, other), the pathname only.
function ServerSwitchHref(pathname: string): string {
  SwitchPath(pathname, Other(LangOf(pathname)))
}

// [POST-02] i18n.ts switchHref, called by the browser handler.
function SwitchHref(pathname: string, search: string, hash: string, lang: Lang): string {
  SwitchPath(pathname, lang) + search + hash
}

lemma RoundTrip(p: string, lang: Lang)
  requires SharedPath(p)
  ensures LangOf(LocalizedPath(p, lang)) == lang
  ensures PathWithoutLang(LocalizedPath(p, lang)) == p
{
  if lang == En {
    if p == "/" {
      assert LocalizedPath(p, lang) == Prefix;
    } else {
      assert |p| >= 2 ==> p[1] != '#' && p[1] != '?';
      var q := LocalizedPath(p, lang);
      assert q == Prefix + p;
      assert Prefix + "/" <= q;
      assert q[|Prefix|..] == p;
    }
  }
}

// [POST-01] The switch opens the same page in the other language.
lemma SwitchTarget(route: string, lang: Lang)
  requires SharedPath(route)
  ensures ServerSwitchHref(LocalizedPath(route, lang)) == LocalizedPath(route, Other(lang))
  ensures LangOf(ServerSwitchHref(LocalizedPath(route, lang))) == Other(lang)
  ensures PathWithoutLang(ServerSwitchHref(LocalizedPath(route, lang))) == route
{
  RoundTrip(route, lang);
  RoundTrip(route, Other(lang));
}

// [STT-01] Switching twice returns to the start.
lemma SwitchTwice(route: string, lang: Lang)
  requires SharedPath(route)
  ensures ServerSwitchHref(ServerSwitchHref(LocalizedPath(route, lang))) == LocalizedPath(route, lang)
{
  SwitchTarget(route, lang);
  SwitchTarget(route, Other(lang));
  assert Other(Other(lang)) == lang;
}

// [POST-02, STT-02] The browser href keeps the query and the hash, after the server href.
lemma SwitchKeepsQueryAndHash(route: string, lang: Lang, search: string, hash: string)
  requires SharedPath(route)
  requires search == "" || search[0] == '?'
  requires hash == "" || hash[0] == '#'
  ensures var href := SwitchHref(LocalizedPath(route, lang), search, hash, Other(lang));
    && href == ServerSwitchHref(LocalizedPath(route, lang)) + search + hash
    && href[|ServerSwitchHref(LocalizedPath(route, lang))|..] == search + hash
{
  RoundTrip(route, lang);
  var server := ServerSwitchHref(LocalizedPath(route, lang));
  var href := SwitchHref(LocalizedPath(route, lang), search, hash, Other(lang));
  assert href == server + (search + hash);
}

// [POST-01, POST-02] Security: for ANY pathname (the header renders on 404 pages too), both hrefs of the
// switch are same-origin absolute paths. No SharedPath precondition.
lemma SwitchStaysOnSite(pathname: string, search: string, hash: string, lang: Lang)
  requires search == "" || search[0] == '?'
  requires hash == "" || hash[0] == '#'
  ensures OnSite(SwitchPath(pathname, lang))
  ensures OnSite(ServerSwitchHref(pathname))
  ensures OnSite(SwitchHref(pathname, search, hash, lang))
{
  var route := PathWithoutLang(pathname);
  var safe := if OnSite(route) then route else "/";
  assert OnSite(safe);
  forall l: Lang ensures OnSite(LocalizedPath(safe, l)) {
    if l == En {
      var q := LocalizedPath(safe, l);
      assert q[0] == '/' && q[1] == 'e';
    }
  }
  var p := SwitchPath(pathname, lang);
  var href := p + search + hash;
  if |p| == 1 && |href| >= 2 {
    assert href[1] == (search + hash)[0];
  } else if |p| >= 2 {
    assert href[1] == p[1];
  }
}
```

## Chapters and text tables

Ids, numbers, slugs, modules and shared paths are written once. Reader text is written with `bilingual(ja, en)`,
which gives `{ ja, en }`; TypeScript fails when the English value does not have the Japanese value's shape.
Nothing has a Japanese default: callers pass the language (`chaptersIn(lang)`, `appendixIn(lang)`,
`chapter(slug, lang)`, `term(name, lang)`). Japanese-only page files pass the literal `'ja'`.

- `chaptersIn(lang)` keeps each chapter's slug, number and section ids, and gives text and `href` in `lang`.
- `chapterByHref(pathname)` returns the chapter of `chaptersIn(langOf(pathname))` whose `href` equals the pathname
  without a trailing slash. So `H2` shows section titles in the reader's language.
- A chapter's position in the list is found by `slug`, never by object identity.
- Route comparisons use `pathWithoutLang(page.url.pathname)` against shared paths.
- Anchor ids are the section ids, so every anchor is the same in both languages.

#### Formal check: chapters and tables [INV-06, INV-10, INV-11, INV-15, INV-18, TYP-01, ALG-02]

```dafny:ChapterTables.dfy
datatype Lang = Ja | En

const Prefix: string := "/en"

function LangOf(p: string): Lang {
  if p == Prefix || Prefix + "/" <= p then En else Ja
}

function PathWithoutLang(p: string): string {
  if LangOf(p) == En then (if p[|Prefix|..] == "" then "/" else p[|Prefix|..]) else p
}

function LocalizedPath(path: string, lang: Lang): string {
  if lang == Ja then path
  else if path == "/" || (|path| >= 2 && path[0] == '/' && (path[1] == '#' || path[1] == '?')) then Prefix + path[1..]
  else Prefix + path
}

// A same-origin absolute path: `/`, or `/` and then a character that is not `/` or `\`.
predicate OnSite(p: string) {
  |p| >= 1 && p[0] == '/' && (|p| == 1 || (p[1] != '/' && p[1] != '\\'))
}

predicate SharedPath(p: string) {
  OnSite(p) && LangOf(p) == Ja && forall i :: 0 <= i < |p| ==> p[i] != '#' && p[i] != '?'
}

lemma RoundTrip(p: string, lang: Lang)
  requires SharedPath(p)
  ensures LangOf(LocalizedPath(p, lang)) == lang
  ensures PathWithoutLang(LocalizedPath(p, lang)) == p
{
  if lang == En {
    if p == "/" {
      assert LocalizedPath(p, lang) == Prefix;
    } else {
      assert |p| >= 2 ==> p[1] != '#' && p[1] != '?';
      var q := LocalizedPath(p, lang);
      assert q == Prefix + p;
      assert Prefix + "/" <= q;
      assert q[|Prefix|..] == p;
    }
  }
}

// [TYP-01, INV-11] bilingual(ja, en): both values always exist.
datatype Text = Text(ja: string, en: string)

function Pick(t: Text, lang: Lang): string {
  if lang == Ja then t.ja else t.en
}

// [INV-18] Adding English does not change what a Japanese reader sees.
lemma JapaneseUnchanged(ja: string, en: string)
  ensures Pick(Text(ja, en), Ja) == ja
{
}

datatype Source = Source(slug: string, href: string, title: Text, ids: seq<string>, titles: seq<Text>)
datatype Chapter = Chapter(slug: string, href: string, title: string, ids: seq<string>, titles: seq<string>)

// site.ts sources: unique slugs and shared paths, one title per section, no trailing slash.
predicate ValidSources(s: seq<Source>) {
  && (forall i :: 0 <= i < |s| ==> SharedPath(s[i].href) && s[i].href != "/" && s[i].href[|s[i].href| - 1] != '/')
  && (forall i :: 0 <= i < |s| ==> |s[i].ids| == |s[i].titles|)
  && (forall i, j :: 0 <= i < j < |s| ==> s[i].href != s[j].href && s[i].slug != s[j].slug)
}

// [ALG-02] site.ts localize: one chapter in one language.
function Localize(c: Source, lang: Lang): Chapter {
  Chapter(c.slug, LocalizedPath(c.href, lang), Pick(c.title, lang), c.ids, seq(|c.titles|, i requires 0 <= i < |c.titles| => Pick(c.titles[i], lang)))
}

function ChaptersIn(s: seq<Source>, lang: Lang): seq<Chapter> {
  seq(|s|, i requires 0 <= i < |s| => Localize(s[i], lang))
}

// `pathname.replace(/\/$/, '') || '/'`
function StripSlash(p: string): string {
  if |p| > 0 && p[|p| - 1] == '/' then (if p[..|p| - 1] == "" then "/" else p[..|p| - 1]) else p
}

datatype Option<T> = None | Some(value: T)

function FindByHref(list: seq<Chapter>, href: string): Option<Chapter> {
  if |list| == 0 then None
  else if list[0].href == href then Some(list[0])
  else FindByHref(list[1..], href)
}

// [ALG-02] site.ts chapterByHref.
function ChapterByHref(s: seq<Source>, pathname: string): Option<Chapter> {
  var p := StripSlash(pathname);
  FindByHref(ChaptersIn(s, LangOf(p)), p)
}

function IndexBySlug(list: seq<Chapter>, slug: string): int {
  if |list| == 0 then -1
  else if list[0].slug == slug then 0
  else var rest := IndexBySlug(list[1..], slug); if rest < 0 then -1 else rest + 1
}

lemma FindUnique(list: seq<Chapter>, k: int, href: string)
  requires 0 <= k < |list| && list[k].href == href
  requires forall i :: 0 <= i < |list| && i != k ==> list[i].href != href
  ensures FindByHref(list, href) == Some(list[k])
{
  if k > 0 {
    FindUnique(list[1..], k - 1, href);
  }
}

lemma IndexUnique(list: seq<Chapter>, k: int, slug: string)
  requires 0 <= k < |list| && list[k].slug == slug
  requires forall i :: 0 <= i < |list| && i != k ==> list[i].slug != slug
  ensures IndexBySlug(list, slug) == k
{
  if k > 0 {
    IndexUnique(list[1..], k - 1, slug);
  }
}

lemma LocalizedNoTrailingSlash(h: string, lang: Lang)
  requires SharedPath(h) && h != "/" && h[|h| - 1] != '/'
  ensures StripSlash(LocalizedPath(h, lang)) == LocalizedPath(h, lang)
{
  if lang == En {
    assert |h| >= 2 && h[1] != '#' && h[1] != '?';
    assert LocalizedPath(h, lang) == Prefix + h;
  }
}

// [ALG-02] chapterByHref returns the chapter in the reader's language, with or without a trailing slash.
lemma ChapterByHrefFinds(s: seq<Source>, k: int, lang: Lang)
  requires ValidSources(s) && 0 <= k < |s|
  ensures ChapterByHref(s, LocalizedPath(s[k].href, lang)) == Some(Localize(s[k], lang))
  ensures ChapterByHref(s, LocalizedPath(s[k].href, lang) + "/") == Some(Localize(s[k], lang))
{
  var h := LocalizedPath(s[k].href, lang);
  LocalizedNoTrailingSlash(s[k].href, lang);
  RoundTrip(s[k].href, lang);
  var list := ChaptersIn(s, lang);
  forall i | 0 <= i < |list| && i != k
    ensures list[i].href != h
  {
    if list[i].href == h {
      RoundTrip(s[i].href, lang);
    }
  }
  FindUnique(list, k, h);
  assert (h + "/")[..|h + "/"| - 1] == h;
  assert h != "";
}

// Positions use the slug, so they are the same in both languages.
lemma OrdinalBySlug(s: seq<Source>, k: int)
  requires ValidSources(s) && 0 <= k < |s|
  ensures IndexBySlug(ChaptersIn(s, Ja), s[k].slug) == k
  ensures IndexBySlug(ChaptersIn(s, En), s[k].slug) == k
{
  IndexUnique(ChaptersIn(s, Ja), k, s[k].slug);
  IndexUnique(ChaptersIn(s, En), k, s[k].slug);
}

// [INV-06] Section ids, slugs and numbers of sections are the same in both languages.
lemma AnchorsLanguageNeutral(s: seq<Source>, k: int)
  requires ValidSources(s) && 0 <= k < |s|
  ensures ChaptersIn(s, Ja)[k].ids == ChaptersIn(s, En)[k].ids == s[k].ids
  ensures ChaptersIn(s, Ja)[k].slug == ChaptersIn(s, En)[k].slug
  ensures |ChaptersIn(s, En)[k].titles| == |s[k].ids|
{
}

// [INV-10] The position marker looks up the shared path, so both languages get the same list.
function Positions(table: map<string, seq<string>>, href: string): seq<string> {
  var key := PathWithoutLang(href);
  if key in table then table[key] else []
}

lemma PositionsLanguageNeutral(table: map<string, seq<string>>, h: string)
  requires SharedPath(h)
  ensures Positions(table, LocalizedPath(h, En)) == Positions(table, LocalizedPath(h, Ja))
{
  RoundTrip(h, En);
  RoundTrip(h, Ja);
}

// [INV-15] Every lookup takes the language; the English table is never empty where the Japanese one is not.
lemma NoHiddenDefault(s: seq<Source>)
  ensures |ChaptersIn(s, En)| == |ChaptersIn(s, Ja)| == |s|
{
}
```

## Links and anchors

- English page files link to site pages with `/en`; Japanese files never do. Links that are not site pages are
  the same in both languages: `#id`, `/api/source/...`, static files and external URLs.
- Data hrefs (chapters, appendix, overview figure, guide, position marker) are shared paths and are rendered with
  `localizedPath(href, readerLang())`.
- Every English site link resolves to a route, and its `#id` exists on that page.
- The kernel overview figure follows "Why a kernel" (`why`, then `overview`) in both languages.

#### Formal check: links [INV-07, INV-08, INV-09, TYP-03, STT-01]

```dafny:LinkRules.dfy
datatype Lang = Ja | En

const Prefix: string := "/en"

function LangOf(p: string): Lang {
  if p == Prefix || Prefix + "/" <= p then En else Ja
}

function PathWithoutLang(p: string): string {
  if LangOf(p) == En then (if p[|Prefix|..] == "" then "/" else p[|Prefix|..]) else p
}

function LocalizedPath(path: string, lang: Lang): string {
  if lang == Ja then path
  else if path == "/" || (|path| >= 2 && path[0] == '/' && (path[1] == '#' || path[1] == '?')) then Prefix + path[1..]
  else Prefix + path
}

// A same-origin absolute path: `/`, or `/` and then a character that is not `/` or `\`.
predicate OnSite(p: string) {
  |p| >= 1 && p[0] == '/' && (|p| == 1 || (p[1] != '/' && p[1] != '\\'))
}

predicate SharedPath(p: string) {
  OnSite(p) && LangOf(p) == Ja && forall i :: 0 <= i < |p| ==> p[i] != '#' && p[i] != '?'
}

lemma RoundTrip(p: string, lang: Lang)
  requires SharedPath(p)
  ensures LangOf(LocalizedPath(p, lang)) == lang
  ensures PathWithoutLang(LocalizedPath(p, lang)) == p
{
  if lang == En {
    if p == "/" {
      assert LocalizedPath(p, lang) == Prefix;
    } else {
      assert |p| >= 2 ==> p[1] != '#' && p[1] != '?';
      var q := LocalizedPath(p, lang);
      assert q == Prefix + p;
      assert Prefix + "/" <= q;
      assert q[|Prefix|..] == p;
    }
  }
}

// [TYP-03] What a link points to. The test's classifier checks in this order, so the kinds never overlap.
datatype Kind = Anchor | External | Endpoint | Asset | SitePage

function Classify(href: string, assets: set<string>): Kind {
  if |href| > 0 && href[0] == '#' then Anchor
  else if "http://" <= href || "https://" <= href || "mailto:" <= href then External
  else if "/api/" <= href then Endpoint
  else if href in assets then Asset
  else SitePage
}

// [TYP-03] A link that is not a site page is the same in both languages.
lemma NonPageLinksShared(href: string, assets: set<string>)
  requires Classify(href, assets) != SitePage
  ensures Classify(href, assets) in {Anchor, External, Endpoint, Asset}
{
}

// A site link in shared form: a route and an optional anchor id.
datatype Link = Link(route: string, anchor: string)

function Render(link: Link, lang: Lang): string {
  LocalizedPath(link.route, lang) + (if link.anchor == "" then "" else "#" + link.anchor)
}

// [INV-07] English site links start with /en, Japanese ones never do.
lemma LinkLanguage(link: Link)
  requires SharedPath(link.route)
  ensures LangOf(LocalizedPath(link.route, En)) == En
  ensures LangOf(LocalizedPath(link.route, Ja)) == Ja
{
  RoundTrip(link.route, En);
  RoundTrip(link.route, Ja);
}

// Page ids depend on the route only (they are section ids and static ids, the same in both page files).
predicate Resolves(routes: map<string, set<string>>, pathname: string, anchor: string) {
  var route := PathWithoutLang(pathname);
  route in routes && (anchor == "" || anchor in routes[route])
}

// [INV-08] If the Japanese link resolves, the English link resolves to the same page and anchor.
lemma EnglishLinkResolves(routes: map<string, set<string>>, link: Link)
  requires SharedPath(link.route)
  requires Resolves(routes, LocalizedPath(link.route, Ja), link.anchor)
  ensures Resolves(routes, LocalizedPath(link.route, En), link.anchor)
{
  RoundTrip(link.route, En);
  RoundTrip(link.route, Ja);
}

// [STT-01] Following a site link never changes the language; only the switch does.
lemma NavigationKeepsLanguage(link: Link, lang: Lang)
  requires SharedPath(link.route)
  ensures LangOf(LocalizedPath(link.route, lang)) == lang
{
  RoundTrip(link.route, lang);
}

// [INV-09] The overview figure comes right after "why" in a section id list.
predicate OverviewFollowsWhy(ids: seq<string>) {
  exists i :: 0 <= i < |ids| - 1 && ids[i] == "why" && ids[i + 1] == "overview"
}

lemma OverviewInBothLanguages(ja: seq<string>, en: seq<string>)
  requires ja == en && OverviewFollowsWhy(ja)
  ensures OverviewFollowsWhy(en)
{
}
```

## Prerendering

Two routes are prerendered: `/` and `/why`. Their English paths are not route paths, so `svelte.config.js` lists
them: `kit.prerender.entries: ['*', '/en', '/en/why']`. Without them, the server answers `/en/why` with the
prerendered Japanese `/why` page (SvelteKit `respond.js` fetches the prerendered path after `reroute`).

- No server code reads `url.search`, `url.searchParams` or the hash.
- No absolute site URL is written (no alternate links, no origin constant).
- The proof below assumes the prerendered routes are exactly `/` and `/why`. `src/routes/prerender.test.ts` checks
  this assumption on the code: it reads every `export const prerender` under `src/routes` (none on a layout), and
  checks that `/en` + each prerendered route is in `entries`.
- `scripts/check-prerender.mjs` runs after `vite build`: `en.html` and `en/why.html` have `<html lang="en"`,
  `index.html` and `why.html` have `<html lang="ja"`, and no HTML contains `sveltekit-prerender`.

#### Formal check: prerendered pages [ALG-03, INV-05, INV-17, POST-05, TYP-02]

```dafny:Prerendering.dfy
datatype Lang = Ja | En

const Prefix: string := "/en"

function LangOf(p: string): Lang {
  if p == Prefix || Prefix + "/" <= p then En else Ja
}

function PathWithoutLang(p: string): string {
  if LangOf(p) == En then (if p[|Prefix|..] == "" then "/" else p[|Prefix|..]) else p
}

function LocalizedPath(path: string, lang: Lang): string {
  if lang == Ja then path
  else if path == "/" || (|path| >= 2 && path[0] == '/' && (path[1] == '#' || path[1] == '?')) then Prefix + path[1..]
  else Prefix + path
}

// A same-origin absolute path: `/`, or `/` and then a character that is not `/` or `\`.
predicate OnSite(p: string) {
  |p| >= 1 && p[0] == '/' && (|p| == 1 || (p[1] != '/' && p[1] != '\\'))
}

predicate SharedPath(p: string) {
  OnSite(p) && LangOf(p) == Ja && forall i :: 0 <= i < |p| ==> p[i] != '#' && p[i] != '?'
}

lemma RoundTrip(p: string, lang: Lang)
  requires SharedPath(p)
  ensures LangOf(LocalizedPath(p, lang)) == lang
  ensures PathWithoutLang(LocalizedPath(p, lang)) == p
{
  if lang == En {
    if p == "/" {
      assert LocalizedPath(p, lang) == Prefix;
    } else {
      assert |p| >= 2 ==> p[1] != '#' && p[1] != '?';
      var q := LocalizedPath(p, lang);
      assert q == Prefix + p;
      assert Prefix + "/" <= q;
      assert q[|Prefix|..] == p;
    }
  }
}

function Resolved(p: string): string {
  if LangOf(p) == En then PathWithoutLang(p) else p
}

// [TYP-02] How a route is rendered.
datatype Mode = Prerendered | ServerRendered | ClientOnly

// Paths written at build time: entries whose resolved route is prerendered. The crawler may add more; the
// proof uses entries only, so it does not depend on links.
function Written(entries: set<string>, modes: map<string, Mode>): set<string> {
  set e | e in entries && Resolved(e) in modes && modes[Resolved(e)] == Prerendered
}

// The html of a written path gets langOf(that path) from hooks.server.ts at build time.
// [ALG-03] Kit runtime: a written file first; else, after reroute, a written file of the resolved path
// (respond.js); else a server or client render of the request, whose html lang is langOf(request).
function ServedLang(request: string, written: set<string>): Lang {
  if request in written then LangOf(request)
  else if Resolved(request) != request && Resolved(request) in written then LangOf(Resolved(request))
  // For a prerendered route that was not written, kit answers 404 (the route is not in the server manifest).
  // Under the preconditions of EveryPageInItsLanguage this branch is not reached for such a route.
  else LangOf(request)
}

// The site: "/" and "/why" are prerendered.
predicate SiteModes(modes: map<string, Mode>) {
  && "/" in modes && modes["/"] == Prerendered
  && "/why" in modes && modes["/why"] == Prerendered
  && forall r :: r in modes ==> SharedPath(r)
}

// entries: ['*', '/en', '/en/why'], where '*' gives every prerendered route path.
function SiteEntries(modes: map<string, Mode>): set<string> {
  (set r | r in modes && modes[r] == Prerendered) + {"/en", "/en/why"}
}

// [ALG-03, INV-05, TYP-02] Every page is served in the language of its URL.
lemma EveryPageInItsLanguage(modes: map<string, Mode>, route: string, lang: Lang)
  requires SiteModes(modes)
  requires (set r | r in modes && modes[r] == Prerendered) == {"/", "/why"}
  requires route in modes
  ensures ServedLang(LocalizedPath(route, lang), Written(SiteEntries(modes), modes)) == lang
{
  RoundTrip(route, lang);
  var request := LocalizedPath(route, lang);
  var written := Written(SiteEntries(modes), modes);
  if lang == En && modes[route] == Prerendered {
    var prerendered := set r | r in modes && modes[r] == Prerendered;
    assert route in prerendered;
    assert prerendered == {"/", "/why"};
    assert route in {"/", "/why"};
    if route == "/" {
      assert request == "/en";
    } else {
      assert request == "/en/why";
    }
    assert Resolved(request) == route;
    assert request in SiteEntries(modes);
    assert request in written;
  }
}

// [POST-05] The four prerendered files and their languages.
lemma PrerenderedFiles(modes: map<string, Mode>)
  requires SiteModes(modes)
  ensures {"/", "/why", "/en", "/en/why"} <= Written(SiteEntries(modes), modes)
{
  assert Resolved("/en") == "/" && Resolved("/en/why") == "/why";
  assert Resolved("/") == "/" && Resolved("/why") == "/why";
}

// Positive control: with entries ['*'] only, /en/why is served from the Japanese file.
lemma WithoutEnglishEntries(modes: map<string, Mode>)
  requires SiteModes(modes)
  requires (set r | r in modes && modes[r] == Prerendered) == {"/", "/why"}
  ensures ServedLang("/en/why", Written({"/", "/why"}, modes)) == Ja
{
  var written := Written({"/", "/why"}, modes);
  assert "/why" in written;
  assert "/en/why" !in written;
  assert Resolved("/en/why") == "/why";
}

// [INV-17] No absolute URL: the build check rejects the default prerender origin anywhere in the output.
ghost predicate OutputOk(html: seq<string>) {
  forall i :: 0 <= i < |html| ==> !ContainsOrigin(html[i])
}

const Origin: string := "sveltekit-prerender"

predicate OriginAt(page: string, i: int) {
  0 <= i <= |page| - |Origin| && page[i..i + |Origin|] == Origin
}

ghost predicate ContainsOrigin(page: string) {
  exists i :: OriginAt(page, i)
}

lemma OriginRejected(html: seq<string>, k: int)
  requires 0 <= k < |html| && ContainsOrigin(html[k])
  ensures !OutputOk(html)
{
}
```

## Text checks

`scripts/lint-english.mjs` checks English text, and it also scans every non-test `.ts` and `.svelte` file under
`src/lib` and `src/routes` (except `page.ja.svelte`) and `src/app.html` for Japanese text. It reads reader-facing
strings; developer comments that are never shown are not read. Comments in site-written code examples are reader
text. Allowed Japanese is listed in `scripts/japanese-allowlist.json` as exact `{ file, text, reason }` entries; an
entry whose file is not scanned or whose text is not found fails the check.

- Abbreviations in English: only AST, HIR, CSS, HTML, JSON, UTF-8, UTF-16 and ASCII. The Japanese rule allows only
  AST and HIR, as before.
- Fact parity: in each pair of page files, the markup has the same numbers, commit ids, `{...}` expressions and
  `data.code.*` references.
- Gates are never empty. The excerpt test has two domains. Every page whose `+page.server.ts` loads crate excerpts
  (15 at the base tree) must use `data.code.*` in both files, and every use must be loaded. Pages with `mark` checks
  (13 at the base tree, 42 marks per language) must have the same marks in both files, and the total is more than
  zero; `learn/kernel/structured-data` and `learn/measure` quote code without marks. The section and chapter-number
  tests count each language.

#### Formal check: the gates [INV-12, INV-13, INV-14, PRE-07]

```dafny:TextGates.dfy
datatype Finding = Finding(file: string, text: string)
datatype Entry = Entry(file: string, text: string)

// [INV-12] lint-english: every Japanese finding is listed, and every entry is reachable.
predicate LeakCheckPasses(scanned: set<string>, findings: seq<Finding>, allow: seq<Entry>) {
  && (forall f :: f in findings ==> Entry(f.file, f.text) in allow)
  && (forall e :: e in allow ==> e.file in scanned && Finding(e.file, e.text) in findings)
}

lemma LeakCheckSound(scanned: set<string>, findings: seq<Finding>, allow: seq<Entry>)
  requires LeakCheckPasses(scanned, findings, allow)
  ensures forall f :: f in findings ==> exists e :: e in allow && e.file == f.file && e.text == f.text
  ensures forall e :: e in allow ==> e.file in scanned
{
  forall f | f in findings
    ensures exists e :: e in allow && e.file == f.file && e.text == f.text
  {
    assert Entry(f.file, f.text) in allow;
  }
}

// Positive controls: an unlisted label fails; an entry for a file that is not scanned fails.
lemma LeakControls()
  ensures !LeakCheckPasses({"a.svelte"}, [Finding("a.svelte", "ラベル")], [])
  ensures !LeakCheckPasses({"a.svelte"}, [], [Entry("presets.ts", "日本語")])
{
  assert Finding("a.svelte", "ラベル") in [Finding("a.svelte", "ラベル")];
  assert Entry("presets.ts", "日本語") in [Entry("presets.ts", "日本語")];
}

// [INV-13] Fact parity compares multisets of tokens from the markup.
predicate ParityPasses(ja: seq<string>, en: seq<string>) {
  multiset(ja) == multiset(en)
}

lemma ParityControl()
  ensures ParityPasses(["42", "13"], ["13", "42"])
  ensures !ParityPasses(["42", "13"], ["42", "14"])
{
  assert "14" in multiset(["42", "14"]);
  assert "14" !in multiset(["42", "13"]);
}

// [INV-14] excerpts.test.ts. The domain is every page whose server loads crate excerpts (15 at the base tree).
// Each of them must show at least one `data.code.*` in both files. Mark checks are a subset: per page, the same
// count in both files; at least one page has marks (13 pages, 42 marks per language at the base tree). A page
// that quotes code without marks (structured-data, measure) is in the first domain only.
datatype Page = Page(ja: nat, en: nat, jaCode: nat, enCode: nat)

function Marks(pages: seq<Page>, lang: bool): nat {
  if |pages| == 0 then 0 else (if lang then pages[0].en else pages[0].ja) + Marks(pages[1..], lang)
}

predicate ExcerptGatePasses(pages: seq<Page>) {
  && |pages| > 0
  && (forall i :: 0 <= i < |pages| ==> pages[i].ja == pages[i].en && pages[i].jaCode > 0 && pages[i].enCode > 0)
  && Marks(pages, false) > 0
  && Marks(pages, true) == Marks(pages, false)
}

lemma MarksEqual(pages: seq<Page>)
  requires forall i :: 0 <= i < |pages| ==> pages[i].ja == pages[i].en
  ensures Marks(pages, true) == Marks(pages, false)
{
  if |pages| > 0 {
    MarksEqual(pages[1..]);
  }
}

lemma MarksPositive(pages: seq<Page>, k: int)
  requires 0 <= k < |pages| && pages[k].ja > 0
  ensures Marks(pages, false) > 0
{
  if k > 0 {
    MarksPositive(pages[1..], k - 1);
  }
}

// Per-page parity and one marked page are enough; the totals follow.
lemma ExcerptGateFromPages(pages: seq<Page>, k: int)
  requires 0 <= k < |pages| && pages[k].ja > 0
  requires forall i :: 0 <= i < |pages| ==> pages[i].ja == pages[i].en && pages[i].jaCode > 0 && pages[i].enCode > 0
  ensures ExcerptGatePasses(pages)
{
  MarksEqual(pages);
  MarksPositive(pages, k);
}

// Controls: a page file that was not read (no data.code, no marks) fails; marks in one language only fail;
// a page with code and no marks passes next to a marked page (the F2 domain).
lemma ExcerptGateControl()
  ensures !ExcerptGatePasses([Page(3, 3, 5, 5), Page(0, 0, 0, 0)])
  ensures !ExcerptGatePasses([Page(3, 0, 5, 5)])
  ensures !ExcerptGatePasses([Page(0, 0, 10, 10)])
  ensures ExcerptGatePasses([Page(3, 3, 5, 5), Page(0, 0, 10, 10)])
{
  var ok := [Page(3, 3, 5, 5), Page(0, 0, 10, 10)];
  ExcerptGateFromPages(ok, 0);
  assert Marks([Page(0, 0, 10, 10)], false) == 0;
}

// [PRE-07] Abbreviations: the English list is longer than the Japanese list, and nothing else passes.
const EnglishAbbreviations: set<string> := {"AST", "HIR", "CSS", "HTML", "JSON", "UTF-8", "UTF-16", "ASCII"}
const JapaneseAbbreviations: set<string> := {"AST", "HIR"}

lemma AbbreviationControls()
  ensures "JSON" in EnglishAbbreviations && "API" !in EnglishAbbreviations && "IR" !in EnglishAbbreviations
  ensures "JSON" !in JapaneseAbbreviations
  ensures JapaneseAbbreviations <= EnglishAbbreviations
{
}
```

## What the proofs do not cover

| Property | How it is checked |
|---|---|
| The code matches the models above | unit tests of `i18n.ts`, `site.ts`, `hooks.ts`; the build check; review |
| Server code reads no `url.search` | `vite build` (SvelteKit throws while prerendering) |
| Natural, short, correct English | `lint-english.mjs` for patterns; an independent reader for every page |
| Header width at 320 px and 375 px, keyboard order, focus, figures | a browser run; screenshots in the pull request |
| Hash kept across the switch in a real browser | a browser run |

## Where each requirement is checked

Every Phase 1 ID, with the Dafny lemma that states it and the check that holds the code to it. "Stated" means the
lemma is true by definition or checks a model only; it is not counted as a check of the code. PRE and POST share one
sequence (PRE-04, PRE-07; POST-01, 02, 03, 05, 06), so there is no PRE-01 or POST-04.

| ID | Dafny | Code check | Kind |
|---|---|---|---|
| INV-01 | `Injective`, `LanguagesDisjoint` | `i18n.test.ts` round trip over shared paths | proved on model + unit test |
| INV-02 | `Boundary` | `i18n.test.ts` boundary and `/enx` tests | proved on model + unit test |
| INV-03 | `RoundTrip`, `SuffixKept` | `i18n.test.ts` round trip, suffix kept | proved on model + unit test |
| INV-04 | `SameRoute` | `i18n.test.ts` reroute test | proved on model + unit test |
| INV-05 | `DocumentLanguage`, `EveryPageInItsLanguage` | `check-prerender.mjs` (build); browser | proved on model + build check |
| INV-06 | `AnchorsLanguageNeutral` | `sections.test.ts` (H2 id order and static id set per language) | proved on model + unit test |
| INV-07 | `LinkLanguage` | link test (pending); review | proved on model; code check pending |
| INV-08 | `EnglishLinkResolves` | `chapter-refs.test.ts`, `sections.test.ts` | proved on model + unit test |
| INV-09 | `OverviewInBothLanguages` | `sections.test.ts` H2 parity | stated (requires `ja == en`) |
| INV-10 | `PositionsLanguageNeutral` | `i18n.test.ts` position marker parity | proved on model + unit test |
| INV-11 | `Text` | `bilingual` type (`svelte-check`) | stated; type check |
| INV-12 | `LeakCheckSound`, `LeakControls` | `lint-english.mjs`; `english.test.mjs` controls | proved on model + unit test |
| INV-13 | `ParityControl` | fact parity test (pending) | proved on model; code check pending |
| INV-14 | `ExcerptGateFromPages`, `ExcerptGateControl` | `excerpts.test.ts` (15 code pages, 13 marked) | proved on model + unit test |
| INV-15 | `NoHiddenDefault` | signatures of `chapter`, `term` (`svelte-check`) | stated; type check |
| INV-16 | none | `vite build` (kit throws on `url.search` while prerendering); review | not provable here |
| INV-17 | `OriginRejected` | `check-prerender.mjs` | stated; build check |
| INV-18 | `JapaneseUnchanged` | `git diff` of `page.ja.svelte` against the base `+page.svelte`; review | stated; review |
| PRE-04 | `SharedPath`, `OnSite` | callers pass literal site paths; review | stated |
| PRE-07 | `AbbreviationControls` | `english.test.mjs` abbreviation test | stated; unit test |
| POST-01 | `SwitchTarget`, `SwitchStaysOnSite` | `i18n.test.ts` switch and off-site tests | proved on model + unit test |
| POST-02 | `SwitchKeepsQueryAndHash`, `SwitchStaysOnSite` | `i18n.test.ts`; browser | proved on model + unit test |
| POST-03 | none | `data-sveltekit-reload` on the link; browser | not provable here |
| POST-05 | `PrerenderedFiles` | `check-prerender.mjs`; `prerender.test.ts` | proved on model + build check |
| POST-06 | none | review of the `/why` example | not provable here |
| STT-01 | `SwitchTwice`, `NavigationKeepsLanguage` | `i18n.test.ts`; browser | proved on model + unit test |
| STT-02 | `SwitchKeepsQueryAndHash` | browser (playground hash) | proved on model + browser |
| STT-03 | none | browser (`/en/missing` is 404) | not provable here |
| TYP-01 | `Lang` | `Lang` type (`svelte-check`) | stated; type check |
| TYP-02 | `Mode`, `EveryPageInItsLanguage` | `prerender.test.ts` | proved on model + unit test |
| TYP-03 | `Kind` | link classifier in the test | stated |
| TYP-04 | none | `japanese` regex in `scripts/japanese.mjs`; `english.test.mjs` | not provable here |
| ALG-01 | `LangOf`, `PathWithoutLang`, `LocalizedPath`, `SwitchPath` | `i18n.test.ts` | model of the code |
| ALG-02 | `ChapterByHref`, `IndexBySlug` | `i18n.test.ts` chapter tests | proved on model + unit test |
| ALG-03 | `ServedLang`, `WithoutEnglishEntries` | `check-prerender.mjs`; `prerender.test.ts` | proved on model + build check |
| ALG-04 | `LeakCheckPasses` | `english.test.mjs` leak controls | model of the code + unit test |
| ALG-05 | `ParityPasses` | fact parity test (pending) | model; code check pending |

Natural English, layout at 320 px and 375 px, keyboard order and focus are checked by review and a browser only.

## How to run the proofs

Dafny 4.11.0. Each block is written to its own file and checked alone:

```sh
node -e '
const fs = require("fs"), path = require("path");
const out = process.argv[2]; fs.mkdirSync(out, { recursive: true });
const text = fs.readFileSync("docs/site-i18n.md", "utf8");
for (const m of text.matchAll(/```dafny:([A-Za-z.]+)\n([\s\S]*?)```/g)) fs.writeFileSync(path.join(out, m[1]), m[2]);
' "$TMPDIR/site-i18n-proofs"
for f in "$TMPDIR"/site-i18n-proofs/*.dfy; do dafny verify "$f" || exit 1; done
```

Controls that must fail: change the model of the code, not the claim. For example, in `LanguagePaths.dfy` write
`LangOf` as `if Prefix <= p then En else Ja` (no `/` boundary): `Boundary` fails on `/enx`. In
`LanguageSwitch.dfy` write `SwitchPath` without the `OnSite` guard: `SwitchStaysOnSite` fails. In
`Prerendering.dfy` remove `+ {"/en", "/en/why"}` from `SiteEntries`: `EveryPageInItsLanguage` fails.

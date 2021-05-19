# Idiom

Idiom is a simple React-based static site generator. It allows you to write pages in JSX with reusable components and comes with prerendering to make your site search engine friendly.

Idiom takes a similar approach to other site generators like [Gatsby](https://www.gatsbyjs.com) that allow you to write with the expressiveness and composability of React components but without any complicated build configurations or dependencies.

## Install

```console
$ npm install -g https://github.com/choxi/idiomjs.git
```

## Usage

Idiom assumes your site has a specific directory structure:

```
mysite/
  assets/
    image.png
  components/
    Layout.jsx
  pages/
    index.jsx
    my-first-page.jsx
```

Each page is a JSX expression:

```html
<!-- pages/index.jsx -->

<Layout>
  <h1>This is your site's homepage</h1>
  <img src="/assets/image.png">
</Layout>
```

You can run your site in development with:

```console
$ idiomjs serve
Listening on http://localhost:1234
```

When you're ready to deploy your site, you can run:

```console
$ idiomjs build
```

This creates a `dist` directory that can be deployed to GitHub pages or any other static site host. The `build` command automatically prerenders your pages using `jsdom` so they can be parsed by search engines.

## Development

To run idiomjs while developing locally:

```console
$ cd /path/to/idiomjs
$ npm link
$ cd /path/to/test/site
$ npm link idiomjs
$ idiomjs serve
```

Now when you make changes to the `idiomjs` source, you can restart the server to test those changes. See the docs on [npm-link](https://docs.npmjs.com/cli/v7/commands/npm-link) for more info.


TODO

   - [ ] Catch esbuild errors and display them in the server log (sometimes _index.js does not build)
   - [ ] Don't use /dist for development output
   - [ ] Rename "serve" command to develop. Add a "-h" option to CLI
   - [ ] Add react-helmet and docs for using it
   - [ ] Add docs for how directory structure works (rename "assets" to "static"?)
   - [ ] Auto-refresh page on changes
   - [ ] Remove file change logs from server output
   - [x] Minify build for production
   - [x] Add source maps for development

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

This creates a `dist` directory that can be deployed to GitHub pages or any other static site host. The `build` command automatically prerenders your pages using `ReactDOMServer` so they can be parsed by search engines.

## Writing Pages

Since Idiom autoloads your components, a page is just a JSX expression:

```
<Layout>
  <h1>This is an Idiom page!</h1>
  <CodeSnippet lang="js">{`
    console.log("Your components are autoloaded")
  `}</CodeSnippet>
</Layout>
```

`react-helmet` is included by default with Idiom:

```
<Layout>
  <Helmet>
    <title>myblog | This is an Idiom page!</title>
    <script>
      /* Add tracking code or third-party scripts */
    </script>
  </Helmet>

  <h1>This is an Idiom page!</h1>
  <CodeSnippet lang="js">{`
    console.log("Your components are autoloaded")
  `}</CodeSnippet>
</Layout>
```

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

#### TODO

   - [ ] Auto-refresh page on changes
   - [ ] Catch esbuild errors and display them in the server log (sometimes _index.js does not build)
   - [ ] Rename "serve" command to develop. Add a "-h" option to CLI
   - [ ] Add docs for how directory structure works (rename "assets" to "static"?)
   - [x] Add react-helmet and docs for using it
   - [x] Fix React Helmet prerendering (https://github.com/nfl/react-helmet#server-usage)
   - [x] Don't use /dist for development output
   - [x] Remove file change logs from server output
   - [x] Minify build for production
   - [x] Add source maps for development

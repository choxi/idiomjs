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
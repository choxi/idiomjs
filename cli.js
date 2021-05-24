#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

const express = require("express")
const chokidar = require("chokidar")
const esbuild = require("esbuild")
const ReactDOMServer = require("react-dom/server")
const React = require("react")
const Helmet = require("react-helmet").default
const sassPlugin = require('esbuild-plugin-sass')

const Builder = require("./src/builder")
const Renderer = require("./src/renderer")
const Prerenderer = require("./src/prerenderer")

const builder = new Builder()
const renderer = new Renderer()
const app = express()
const distDir = path.join(".", "dist")
const buildDir = path.join(".", ".build")

const command = process.argv[2]

if (command === "build") {
  const port = 1111
  app.use(express.static(path.join(distDir)))

  const server = app.listen(port, () => {
    builder.build(distDir, { minify: true }, pages => {
      const promises = pages.map(page => {
        const url = `http://localhost:${ port }/${ page.name }.html`
        return renderer.render(url).then(body => fs.writeFileSync(page.path, body))
      })

      Promise.all(promises).then(() => {
        console.log("Site generated")
        server.close()
      })
    })
  })
}

if (command === "build2") {
  const renderer = new Prerenderer()
  const pages = builder.pages()
  const importStatements = builder.components().map(component => {
    return `import ${ component.klass } from "../components/${ component.path }"`
  })

  pages.forEach(page => {
    const entrypointBody = `
      import React from "react"

      ${ importStatements.join("\n") }

      export default class ${ page.klass } extends React.Component {
        render() {
          return (
            ${ page.body }
          )
        }
      }
    `
    const pageName = path.basename(page.path, ".jsx")
    const entrypointPath = path.join(buildDir, `entry-${ pageName }.jsx`)
    fs.writeFileSync(entrypointPath, entrypointBody)
    const outfilePath = path.join(buildDir, `node-${ pageName }.js`)

    const options = {
      entryPoints: [ entrypointPath ],
      bundle: true,
      outfile: outfilePath,
      platform: "node",
      format: "cjs",
      external: [ "react-helmet" ],
      plugins: [ sassPlugin() ]
    }

    esbuild.build(options).then(() => {
      const loadPath = path.resolve(outfilePath)
      const Component = require(loadPath).default
      const body = ReactDOMServer.renderToString(React.createElement(Component))
      const helmet = Helmet.renderStatic()
      console.log(helmet.title.toString())
      const html = `
        <!doctype html>
        <html ${ helmet.htmlAttributes.toString() }>
          <head>
            <link rel="stylesheet" href="/index.css">
            <script async src="/index.js"></script>

            ${ helmet.title.toString() }
            ${ helmet.meta.toString() }
            ${ helmet.link.toString() }
            ${ helmet.script.toString() }
            ${ helmet.noscript.toString() }
            ${ helmet.style.toString() }
          </head>
          <body ${ helmet.bodyAttributes.toString() }>
            <div id="${ page.klass }">
              ${ body }
            </div>
          </body>
        </html>
      `
      const prerenderedOutputPath = path.join(buildDir, `${ pageName }.html`)
      fs.writeFileSync(prerenderedOutputPath, html)
    })
  })
}

if (command === "serve") {
  const port = 1234
  const watcher = chokidar.watch(".", { ignored: new RegExp(`${buildDir}|${distDir}|node_modules`) })

  watcher.on("ready", () => {
    watcher.on("all", (event, path) => {
      builder.build(buildDir, { sourcemap: true })
    })
  })

  builder.build(buildDir, { sourcemap: true })
  app.use(express.static(buildDir, { extensions: [ "html" ] }))
  app.listen(port, () => console.log(`Listening on http://localhost:${port}`))
}

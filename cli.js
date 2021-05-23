#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

const express = require("express")
const chokidar = require("chokidar")
const esbuild = require("esbuild")
const ReactDOMServer = require("react-dom/server")
const React = require("react")
const Helmet = require("react-helmet")

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

  // const pages = getPages()
  // pages.forEach(page => {
    // Try testing this with a simple component
    //
    const page = { path: path.join(".", "test.jsx") }
    output = "./temp-component.js"
    const options = {
      entryPoints: [ page.path ],
      outfile: output,
      platform: "node",
      format: "cjs"
    }
    esbuild.build(options).then(() => {
      const loadPath = path.resolve(output)
      const Component = require(loadPath).default
      const body = ReactDOMServer.renderToString(React.createElement(Component))
      // Does this work for multiple components?
      const helmet = Helmet.default.renderStatic()
      console.log(helmet.title.toString())
      const html = `
        <html>
          <head>
            <script src="/index.js">
            <script src="/index.css">
          </head>
          <body>
            <div id="${ page.klass }">
              ${ body }
            </div>
          </body>
        </html>
      `
      renderer.render(page)
    })
  // })
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

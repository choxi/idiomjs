#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

const express = require("express")
const chokidar = require("chokidar")

const Builder = require("./src/builder")
const Renderer = require("./src/renderer")

const builder = new Builder()
const renderer = new Renderer()
const app = express()
const outputDirectory = path.join(".", "dist")

const command = process.argv[2]


if (command === "build") {
  const port = 1111
  app.use(express.static(path.join(outputDirectory)))

  const server = app.listen(port, () => {
    builder.build({ minify: true }, pages => {
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

if (command === "serve") {
  const port = 1234
  const watcher = chokidar.watch(".", {
    ignored: /dist|node_modules|.cache|.git/
  })

  watcher.on("ready", () => {
    watcher.on("all", (event, path) => {
      console.log(event, path)
      builder.build()
    })
  })

  builder.build()
  app.use(express.static(outputDirectory, { extensions: [ "html" ] }))

  app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`)
  })
}

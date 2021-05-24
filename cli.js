#!/usr/bin/env node

// console.log(require.main.paths)
console.log(require.resolve("react-helmet"))

const fs = require("fs")
const path = require("path")
const express = require("express")
const chokidar = require("chokidar")

const Builder = require("./src/builder")
const Renderer = require("./src/renderer")
const ReactRenderer = require("./src/react-renderer")
const Project = require("./src/project")

const builder = new Builder()
const renderer = new Renderer()
const project = new Project()
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
  const renderer = new ReactRenderer()
  renderer.render(project, buildDir)
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

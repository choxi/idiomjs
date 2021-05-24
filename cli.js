#!/usr/bin/env node

const path = require("path")
const express = require("express")
const chokidar = require("chokidar")

const Builder = require("./src/builder")
const ReactRenderer = require("./src/react-renderer")
const Project = require("./src/project")

const builder = new Builder()
const renderer = new ReactRenderer()
const project = new Project()
const app = express()
const distDir = path.join(".", "dist")
const buildDir = path.join(".", ".build")

const command = process.argv[2]

if (command === "build") {
  builder.build(project, buildDir, { sourcemap: true, minify: true })
  renderer.render(project, buildDir).then(() => {
    console.log("Site built")
  })
}

if (command === "serve") {
  const port = 1234
  const watcher = chokidar.watch(".", { ignored: new RegExp(`${buildDir}|${distDir}|node_modules`) })

  watcher.on("ready", () => {
    watcher.on("all", (event, path) => {
      builder.build(project, buildDir, { sourcemap: true })
    })
  })

  builder.build(project, buildDir, { sourcemap: true })
  app.use(express.static(buildDir, { extensions: [ "html" ] }))
  app.listen(port, () => console.log(`Listening on http://localhost:${port}`))
}

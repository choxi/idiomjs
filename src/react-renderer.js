const fs = require("fs")
const fse = require("fs-extra")
const path = require("path")
const esbuild = require("esbuild")
const ReactDOMServer = require("react-dom/server")
const SassPlugin = require('esbuild-plugin-sass')

const React = require("react")
const Helmet = require("react-helmet").default
const tmpDir = path.resolve(path.join(__dirname, "../", "tmp"))

class ReactRenderer {
  render(project, buildDir) {
    fse.mkdirp(buildDir)
    fse.mkdirp(tmpDir)

    const pages = project.pages()
    const importStatements = project.components().map(component => {
      return `import ${ component.klass } from "../components/${ component.path }"`
    })

    const renders = pages.map(page => {
      const entrypointBody = `
        import React from "react"
        import Helmet from "react-helmet"

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

      // Generate files into a tmp directory in the idiomjs module directory
      // so we always use the local copy of react-helmet. Otherwise helmet.title
      // returns blanks if you try to use a global install of idiomjs
      const outfilePath = path.join(tmpDir, "../", `node-${ pageName }.js`)
      const cssOutPath = path.join(tmpDir, "../", `node-${ pageName }.css`)

      const options = {
        entryPoints: [ entrypointPath ],
        bundle: true,
        outfile: outfilePath,
        platform: "node",
        format: "cjs",
        external: [ "react-helmet" ],
        plugins: [ SassPlugin() ]
      }

      return esbuild.build(options).then(() => {
        const loadPath = outfilePath
        const Component = require(loadPath).default
        const body = ReactDOMServer.renderToString(React.createElement(Component))
        const helmet = Helmet.renderStatic()

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
        fse.removeSync(outfilePath)
        fse.removeSync(entrypointPath)
        fse.removeSync(cssOutPath)
      })
    })

    return Promise.all(renders).then(() => fse.rmdirSync(tmpDir))
  }
}

module.exports = ReactRenderer
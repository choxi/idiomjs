const fs = require("fs")
const fse = require("fs-extra")
const path = require("path")
const esbuild = require("esbuild")
const ReactDOMServer = require("react-dom/server")
const SassPlugin = require('esbuild-plugin-sass')

const React = require("react")
const Helmet = require("react-helmet").default

class ReactRenderer {
  render(project, buildDir) {
    const pages = project.pages()
    const importStatements = project.components().map(component => {
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
        plugins: [ SassPlugin() ]
      }

      esbuild.build(options).then(() => {
        // TODO:
        // This loads react-helmet from the project modules
        // instead of idiomjs modules, which breaks using
        // a global idiomjs installation.
        const loadPath = path.resolve(outfilePath)
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
      })
    })
  }
}

module.exports = ReactRenderer
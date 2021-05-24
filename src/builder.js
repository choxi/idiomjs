const esbuild = require("esbuild")
const fs = require("fs")
const fse = require("fs-extra")
const sassPlugin = require('esbuild-plugin-sass')
const path = require("path")

const assetsDir = path.join(".", "assets")

class Builder {
  build(project, buildDir, options={ minify: false, sourcemap: false }, callback=() => {}) {
    fs.rmdirSync(buildDir, { recursive: true, force: true })
    fs.mkdirSync(buildDir)

    const importStatements = project.components().map(component => {
      return `import ${ component.klass } from "../components/${ component.path }"`
    })
    const pages = project.pages()
    const pageComponents = pages.map(page => this.pageTemplate(page.klass, page.body))

    const componentsEntrypoint = `
      import React from "react"
      import ReactDOM from "react-dom"

      ${ importStatements.join("\n") }

      ${ pageComponents.join("\n") }
    `

    const entrypointPath = path.join(buildDir, "_index.jsx")
    fs.writeFileSync(entrypointPath, componentsEntrypoint)

    esbuild.build({
      entryPoints: [ entrypointPath ],
      bundle: true,
      minify: options.minify,
      sourcemap: options.sourcemap,
      outfile: path.join(buildDir, "index.js"),
      plugins: [ sassPlugin() ]
    }).then(() => {
      fse.removeSync(entrypointPath)

      pages.forEach(page => {
        fs.writeFileSync(path.join(buildDir, `${ page.name }.html`), this.htmlTemplate(page.klass))
      })

      fse.copySync(assetsDir, path.join(buildDir, "assets"))

      const outputPages = pages.map(config => {
        return {
          name: config.name,
          path: path.join(buildDir, `${ config.name }.html`)
        }
      })

      callback(outputPages)
    })
  }

  htmlTemplate(page) {
    return `
      <html>
        <head>
          <link rel="stylesheet" href="./index.css">
          <script async src="./index.js"></script>
        </head>
        <body>
          <div id="${ page }"></div>
        </body>
      </html>
    `
  }

  pageTemplate(klass, body) {
    return `
      class ${ klass } extends React.Component {
        render() {
          return (
            ${ body }
          )
        }
      }

      function init${ klass }() {
        const container = document.getElementById("${ klass }")

        if (container && container.children.length === 0) {
          ReactDOM.render(<${ klass } />, container)
          return
        }

        if (container && container.children.length > 0) {
          ReactDOM.hydrate(<${ klass } />, container)
          return
        }

        console.log(\`container: ${ klass } not found \`)
      }

      if(document.readyState !== 'loading') {
        init${ klass }()
      } else {
        document.addEventListener('DOMContentLoaded', function () {
          init${ klass }()
        })
      }
    `
  }
}

module.exports = Builder
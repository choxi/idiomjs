const esbuild = require("esbuild")
const fs = require("fs")
const fse = require("fs-extra")
const pascalCase = require("pascalcase")
const sassPlugin = require('esbuild-plugin-sass')
const path = require("path")

const componentsDir = path.join(".", "components")
const pagesDir = path.join(".", "pages")
const assetsDir = path.join(".", "assets")

class Totem {
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

  components() {
    const componentPaths = fs.readdirSync(componentsDir)
                             .filter(p => p.split(".")[1] === "jsx")

    return componentPaths.map(path => {
      const tag = path.split(".")[0]
      const klass = pascalCase(tag)

      return {
        tag: tag,
        klass: klass,
        path: path
      }
    })
  }

  pages() {
    const pagePaths = fs.readdirSync(pagesDir)
    return pagePaths.map(path => {
      const name = path.split(".")[0]
      const klass = pascalCase(name)
      const body = fs.readFileSync(`./pages/${ path }`)

      return {
        name: name,
        path: path,
        klass: klass,
        body: body
      }
    })
  }

  build(buildDir, options={ minify: false, sourcemap: false }, callback=() => {}) {
    fs.rmdirSync(buildDir, { recursive: true, force: true })
    fs.mkdirSync(buildDir)

    const importStatements = this.components().map(component => {
      return `import ${ component.klass } from "../components/${ component.path }"`
    })
    const pages = this.pages()
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
}

module.exports = Totem
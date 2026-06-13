import "@milkdown/theme-nord/style.css"
import "./styles/global.css"
import "./styles/milkdown.css"

import { Application } from "@hotwired/stimulus"
import EditorController from "./controllers/editor_controller"

const app = Application.start()
app.register("editor", EditorController)

document.addEventListener("turbo:load", () => app.load())

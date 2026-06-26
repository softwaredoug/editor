import { AppComponent } from "./components/app-component.js";

const mountEl = document.getElementById("app-root");
const app = new AppComponent({ mountEl, window });
app.init();

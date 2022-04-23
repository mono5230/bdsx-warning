import { events } from "bdsx/event";

events.serverOpen.on(() => {
    import ("./warr");
    console.log("warning plugin loaded")
})

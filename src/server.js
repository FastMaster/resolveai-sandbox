import { createServer } from "node:http";
import { handler } from "./app.js";

const port = Number(process.env.PORT ?? 3000);
createServer(handler).listen(port, () => {
  console.log(`Patients API listening on ${port}`);
});

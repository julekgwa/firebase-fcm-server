import { makeApp } from './app/app.js';
import setTZ from 'set-tz';
import IP from 'ip';
setTZ('UTC');

const PORT = Number(process.env.PORT || '8080');

makeApp()
  .then((app) => app.listen(PORT))
  .then(() =>
    console.log(`⚡️[server]: Server is running at http://${IP.address()}:${PORT}`),
  )
  .catch((error) => console.log('caught an error', error));
